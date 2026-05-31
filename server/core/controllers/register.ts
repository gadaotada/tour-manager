import type { Express, RequestHandler } from "express";

import { validateRequest } from "@core/validation";
import { AppError } from "@core/http";

import type { AppController, AppControllerBuilder, BuildableController } from "./internal.types";
import type { AppMiddleware, RoutePipelineStep } from "./public.types";
import { createBaseContext, isProceedSignal, mergeContext, type MutableBaseContext } from "./context";

type RegisterControllersOptions = {
    apiPrefix: string;
};

type RegisterableController = AppController | AppControllerBuilder;

function registerControllers(app: Express, controllers: RegisterableController[], options: RegisterControllersOptions): void {
    const methodsByPath = new Map<string, Set<string>>();

    for (const controller of controllers) {
        // `build()` is intentionally not on the public `AppController` surface;
        // the runtime object always implements it.
        const internals = (controller as unknown as BuildableController).build();

        for (const route of internals.routes) {
            const fullPath = `${options.apiPrefix}${internals.basePath}${route.path}`;
            app[route.method](fullPath, createRouteHandler(internals.middlewares, route.handlers, route.schemas));

            let methods = methodsByPath.get(fullPath);
            if (!methods) {
                methods = new Set();
                methodsByPath.set(fullPath, methods);
            }
            methods.add(route.method.toUpperCase());
        }
    }

    // Catch-alls run after the real routes, so a known method on a known path is
    // already handled; only unmatched verbs on a known path fall through here.
    // Unknown paths match nothing and reach the app's 404 handler as before.
    for (const [fullPath, methods] of methodsByPath) {
        app.all(fullPath, createMethodNotAllowedHandler(methods));
    }
}

function createMethodNotAllowedHandler(methods: Set<string>): RequestHandler {
    const allow = buildAllowHeader(methods);

    return (req, res, next) => {
        res.setHeader("Allow", allow);

        // Answer discovery/preflight directly instead of erroring on it.
        if (req.method === "OPTIONS") {
            res.status(204).end();
            return;
        }

        next(new AppError(405, "METHOD_NOT_ALLOWED", "errors.methodNotAllowed", `Method ${req.method} is not allowed for ${req.path}.`));
    };
}

function buildAllowHeader(methods: Set<string>): string {
    const allow = new Set(methods);
    allow.add("OPTIONS");
    if (allow.has("GET")) allow.add("HEAD");

    return [...allow].join(", ");
}

function createRouteHandler(middlewares: AppMiddleware[], handlers: RoutePipelineStep[], schemas?: Parameters<typeof validateRequest>[1]): RequestHandler {
    return async (req, res, next) => {
        try {
            const ctx = createBaseContext(req, res);
            if (schemas) ctx.parsed = validateRequest(req, schemas);

            for (const middleware of middlewares) {
                if (res.headersSent) return;

                const result = await middleware(ctx);
                mergeContext(ctx, result);

                if (res.headersSent) return;
            }

            await runRoutePipeline(ctx, handlers);
        } catch (error) {
            next(error);
        }
    };
}

async function runRoutePipeline(ctx: MutableBaseContext, handlers: RoutePipelineStep[]): Promise<void> {
    for (const handler of handlers) {
        if (ctx.res.headersSent) return;

        const result = await handler(ctx);

        // A returned value (other than the proceed signal) enriches the context
        // for later steps. Responses are sent exclusively through `ctx.reply.*`,
        // so returning `void` always continues the pipeline.
        if (!isProceedSignal(result)) mergeContext(ctx, result);
    }

    // Reaching the end without a response is a programmer error: surface it as a
    // 500 through the shared error pipeline instead of silently falling through.
    if (!ctx.res.headersSent) {
        throw new AppError(500, "NO_RESPONSE", "errors.internal", "Route pipeline finished without sending a response.");
    }
}

export { registerControllers };
