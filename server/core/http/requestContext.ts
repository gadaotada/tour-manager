import { randomUUID } from "node:crypto";

import type { Request, RequestHandler, Response } from "express";
import { HTTP_HEADERS, type Logger } from "@tour-manager/shared";

import { logger as rootLogger } from "@libs/logger";

type RequestContext = {
    requestId: string;
    logger: Logger;
};

declare global {
    namespace Express {
        interface Locals {
            context: RequestContext;
        }
    }
}

function attachRequestContext(req: Request, res: Response, logger: Logger): void {
    const requestId = req.header(HTTP_HEADERS.REQUEST_ID) ?? randomUUID();

    res.locals.context = {
        requestId,
        logger: logger.child({
            transport: "http",
            requestId,
            method: req.method,
            path: req.path,
        }),
    };
}

function getRequestContext(res: Response): RequestContext {
    if (res.locals.context) return res.locals.context;

    return {
        requestId: "",
        logger: rootLogger,
    };
}

const requestContextMiddleware = (logger: Logger): RequestHandler => {
    return (req, res, next) => {
        attachRequestContext(req, res, logger);
        next();
    };
};

export {
    type RequestContext,
    attachRequestContext,
    getRequestContext,
    requestContextMiddleware,
};
