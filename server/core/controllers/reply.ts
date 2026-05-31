import type { Response } from "express";

import { AppError } from "@core/http";
import {
    negotiateResponseType,
    sendBody,
    serializeClientError,
} from "../http/responseFormat";
import { resolveLocale } from "@libs/i18n";

import type { AppResponse, AppResponsePayload } from "./public.types";

function createReply(res: Response): AppResponse {
    return {
        success: (payload) => sendPayload(res, 200, payload),
        created: (payload) => sendPayload(res, 201, payload),
        noContent: () => res.status(204).send(),
        error: (payload) => sendPayload(res, 500, payload),
        badRequest: (payload) => sendPayload(res, 400, payload),
        notFound: (type) => sendPayload(res, 404, { error: new AppError(404, "NOT_FOUND", "errors.notFound", "General 404 error"), type }),
        unauthorized: (type) => sendPayload(res, 401, { error: new AppError(401, "UNAUTHORIZED", "errors.auth.unauthenticated", "General 401 error"), type }),
        forbidden: (type) => sendPayload(res, 403, { error: new AppError(403, "FORBIDDEN", "errors.auth.forbidden", "General 403 error"), type }),
        internalServerError: (type) => sendPayload(res, 500, { error: new AppError(500, "INTERNAL_SERVER_ERROR", "errors.internal", "General 500 error"), type }),
    };
}

function sendPayload(res: Response, status: number, payload: AppResponsePayload): void {
    if (res.headersSent) return;

    const responseType = payload.type ?? negotiateResponseType(res.req);

    if ("error" in payload) {
        const error = serializeClientError(payload.error, resolveLocale(res.req));
        const body = responseType === "json" ? { ok: false, error } : error.message;

        sendBody(res, status, responseType, body);

        return;
    }

    const body = responseType === "json" ? { ok: true, data: payload.data } : payload.data;

    sendBody(res, status, responseType, body);
}

export { createReply };
