import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { ApiResponse, ClientUser } from "@tour-manager/shared";
import type { RequestContext } from "@libs/request-context";

const ROUTE_METHOD = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "delete",
} as const;

const CONTROLLER_RESPONSE = Symbol("controllerResponse");

type RouteMethod = (typeof ROUTE_METHOD)[keyof typeof ROUTE_METHOD];

type ControllerResponse<T = unknown> = {
  [CONTROLLER_RESPONSE]: true;
  status: number;
  body?: ApiResponse<T>;
};

type Ctx = RequestContext & {
  req: Request;
  res: Response;
  next: NextFunction;
  currentUser?: ClientUser;
  realtime: {
    originSocketId?: string;
  };
};

type ControllerRoute = {
  method: RouteMethod;
  path: string;
  middlewares?: RequestHandler[];
  handler: (ctx: Ctx) => Promise<unknown> | unknown;
};

function route(
  method: RouteMethod,
  path: string,
  handler: ControllerRoute["handler"],
  middlewares?: RequestHandler[],
): ControllerRoute {
  return {
    method,
    path,
    handler,
    ...(middlewares ? { middlewares } : {}),
  };
}

function controllerResponse<T>(
  status: number,
  body?: ApiResponse<T>,
): ControllerResponse<T> {
  return {
    [CONTROLLER_RESPONSE]: true,
    status,
    ...(body ? { body } : {}),
  };
}

function isControllerResponse(value: unknown): value is ControllerResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    CONTROLLER_RESPONSE in value
  );
}

abstract class BaseController {
  abstract basePath: string;
  baseMiddlewares: RequestHandler[] = [];
  abstract routes: readonly ControllerRoute[];

  protected get(
    path: string,
    handler: ControllerRoute["handler"],
    middlewares?: RequestHandler[],
  ): ControllerRoute {
    return route(ROUTE_METHOD.get, path, handler, middlewares);
  }

  protected post(
    path: string,
    handler: ControllerRoute["handler"],
    middlewares?: RequestHandler[],
  ): ControllerRoute {
    return route(ROUTE_METHOD.post, path, handler, middlewares);
  }

  protected put(
    path: string,
    handler: ControllerRoute["handler"],
    middlewares?: RequestHandler[],
  ): ControllerRoute {
    return route(ROUTE_METHOD.put, path, handler, middlewares);
  }

  protected patch(
    path: string,
    handler: ControllerRoute["handler"],
    middlewares?: RequestHandler[],
  ): ControllerRoute {
    return route(ROUTE_METHOD.patch, path, handler, middlewares);
  }

  protected delete(
    path: string,
    handler: ControllerRoute["handler"],
    middlewares?: RequestHandler[],
  ): ControllerRoute {
    return route(ROUTE_METHOD.delete, path, handler, middlewares);
  }

  protected ok<T>(data: T): ControllerResponse<T> {
    return controllerResponse(200, { ok: true, data });
  }

  protected created<T>(data: T): ControllerResponse<T> {
    return controllerResponse(201, { ok: true, data });
  }

  protected noContent(): ControllerResponse {
    return controllerResponse(204);
  }
}

export {
  BaseController,
  isControllerResponse,
  type ControllerRoute,
  type ControllerResponse,
  type Ctx,
};
