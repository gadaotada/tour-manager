import type { Express, RequestHandler } from "express";

import { logger as rootLogger } from "@libs/logger";
import type { BaseController, Ctx } from "./BaseController";

type RegisterControllersOptions = {
  apiPrefix: string;
};

export function registerControllers(
  app: Express,
  controllers: BaseController[],
  options: RegisterControllersOptions,
): void {
  for (const controller of controllers) {
    for (const route of controller.routes) {
      const middlewares: RequestHandler[] = [
        ...controller.baseMiddlewares,
        ...(route.middlewares ?? []),
        async (req, res, next) => {
          try {
            const originSocketId = req.header("x-socket-id");
            const requestContext = res.locals.context;
            const logger = requestContext?.logger ?? rootLogger;
            const requestId = requestContext?.requestId ?? "";
            const ctx: Ctx = {
              req,
              res,
              next,
              logger,
              requestId,
              realtime: originSocketId ? { originSocketId } : {}
            };
            const result = await route.handler.call(controller, ctx);

            if (!res.headersSent && result !== undefined) {
              res.json(result);
            }
          } catch (error) {
            next(error);
          }
        }
      ];

      app[route.method](`${options.apiPrefix}${controller.basePath}${route.path}`, ...middlewares);
    }
  }
}
