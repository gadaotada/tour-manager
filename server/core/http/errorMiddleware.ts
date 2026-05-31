import type { ErrorRequestHandler } from "express";

import { DbError } from "@libs/db";
import { resolveLocale } from "@libs/i18n";

import { getRequestContext } from "./requestContext";
import {
    negotiateResponseType,
    resolveClientErrorStatus,
    sendBody,
    serializeClientError,
} from "./responseFormat";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
    if (res.headersSent) return;

    const locale = resolveLocale(req);
    const status = resolveClientErrorStatus(error);
    const clientError = serializeClientError(error, locale);
    const responseType = negotiateResponseType(req);

    if (status >= 500) {
        getRequestContext(res).logger.error(
            {
                err: error,
                ...(error instanceof DbError
                    ? { dbCode: error.publicError.code, cause: error.publicError.cause }
                    : {}),
            },
            "Server error in request pipeline",
            { report: true },
        );
    }

    const body = responseType === "json" ? { ok: false as const, error: clientError } : clientError.message;

    sendBody(res, status, responseType, body);
};
