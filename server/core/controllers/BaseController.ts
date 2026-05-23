import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { ApiResponse } from "@tour-manager/shared";

export type Ctx = {
  req: Request;
  res: Response;
  next: NextFunction;
  realtime: {
    originSocketId?: string;
  };
};

export type ControllerRoute = {
  method: "get" | "post" | "put" | "patch" | "delete";
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
