import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";
import type { Logger } from "@tour-manager/shared";

import { REQUEST_ID_HEADER, type RequestLocals } from "@libs/request-context";

const requestContextMiddleware = (rootLogger: Logger): RequestHandler<unknown, unknown, unknown, unknown, RequestLocals> => {
  return (req, res, next) => {
    const requestId = req.header(REQUEST_ID_HEADER) ?? randomUUID();

    res.locals.context = {
      requestId,
      logger: rootLogger.child({
        transport: "http",
        requestId,
        method: req.method,
        path: req.path,
      }),
    };

    next();
  };
};

export {
  requestContextMiddleware,
};
