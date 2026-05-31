import type {
    AllowedMethods,
    AppControllerBuilder,
    BuildableController,
    ControllerWithMethod,
    RouteBuilder,
    RouteDefinition,
} from "./internal.types";
import type {
    AppMiddleware,
    RequestSchemas,
    RouteHandler,
    RouteMiddleware,
    RoutePipelineStep,
} from "./public.types";

function createAppController<Extra = object>(basePath: string): AppControllerBuilder<Extra> {
    const controllerMiddlewares: AppMiddleware[] = [];
    const routes: RouteDefinition[] = [];

    function startRoute(method: AllowedMethods, path: string): RouteBuilder<Extra, Extra, undefined> {
        const routeMiddlewares: RoutePipelineStep[] = [];
        let routeSchemas: RequestSchemas | undefined;

        const builder = {
            schemas(schemas: RequestSchemas) {
                routeSchemas = schemas;
                return builder;
            },
            use(middleware: RouteMiddleware) {
                routeMiddlewares.push(middleware as RoutePipelineStep);
                return builder;
            },
            handle(handler: RouteHandler) {
                routes.push({
                    method,
                    path,
                    schemas: routeSchemas,
                    handlers: [...routeMiddlewares, handler as RoutePipelineStep],
                });

                return controller;
            },
        };

        return builder as unknown as RouteBuilder<Extra, Extra, undefined>;
    }

    const controller: AppControllerBuilder<Extra> & BuildableController = {
        with: ((...middlewares: AppMiddleware[]) => {
            controllerMiddlewares.push(...middlewares);
            return controller;
        }) as unknown as ControllerWithMethod<Extra>,
        GET: (path) => startRoute("get", path),
        POST: (path) => startRoute("post", path),
        PUT: (path) => startRoute("put", path),
        PATCH: (path) => startRoute("patch", path),
        DELETE: (path) => startRoute("delete", path),
        build() {
            return {
                basePath,
                middlewares: [...controllerMiddlewares],
                routes: routes.map((route) => ({
                    ...route,
                    handlers: [...route.handlers],
                })),
            };
        },
    };

    return controller;
}

export { createAppController };
