import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { ApiResponse } from "@tour-manager/shared";
import type { RequestContext } from "@libs/request-context";

export type Ctx = RequestContext & {
  req: Request;
  res: Response;
  next: NextFunction;
  realtime: {
    originSocketId?: string;
  };
};

export const ROUTE_METHOD = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "delete",
} as const;

export type RouteMethod = (typeof ROUTE_METHOD)[keyof typeof ROUTE_METHOD];

export type ControllerRoute = {
  method: RouteMethod;
  path: string;
  middlewares?: RequestHandler[];
  handler: (ctx: Ctx) => Promise<unknown> | unknown;
};

export abstract class BaseController {
  abstract basePath: string;
  baseMiddlewares: RequestHandler[] = [];
  abstract routes: readonly ControllerRoute[];

  ok<T>(data: T): ApiResponse<T> {
    return { ok: true, data };
  }

  created<T>(data: T): ApiResponse<T> {
    return { ok: true, data };
  }

  noContent(res: Response): void {
    res.status(204).send();
  }
}
