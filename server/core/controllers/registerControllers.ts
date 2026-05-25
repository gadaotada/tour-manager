import type { Express, RequestHandler } from "express";
import { HTTP_HEADERS } from "@tour-manager/shared";

import { logger as rootLogger } from "@libs/logger";
import {
  isControllerResponse,
  type BaseController,
  type Ctx,
} from "./BaseController";

type RegisterControllersOptions = {
  apiPrefix: string;
};

function registerControllers(
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
            const originSocketId = req.header(HTTP_HEADERS.SOCKET_ID);
            const requestContext = res.locals.context;
            const logger = requestContext?.logger ?? rootLogger;
            const requestId = requestContext?.requestId ?? "";
            const currentUser = res.locals.currentUser;
            const ctx: Ctx = {
              req,
              res,
              next,
              logger,
              requestId,
              ...(currentUser ? { currentUser } : {}),
              realtime: originSocketId ? { originSocketId } : {},
            };
            const result = await route.handler.call(controller, ctx);

            if (!res.headersSent && isControllerResponse(result)) {
              if (result.body === undefined) {
                res.status(result.status).send();
                return;
              }

              res.status(result.status).json(result.body);
              return;
            }

            if (!res.headersSent && result !== undefined) {
              res.json(result);
            }
          } catch (error) {
            next(error);
          }
        },
      ];

      app[route.method](
        `${options.apiPrefix}${controller.basePath}${route.path}`,
        ...middlewares,
      );
    }
  }
}

export { registerControllers };
