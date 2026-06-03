import type { Request, Response } from "express";
import { ZodError } from "zod";

import { DB_ERROR_CODES, DbError, type DbErrorCode } from "@libs/db";
import { translate, type Locale } from "@libs/i18n";

import { AppError } from "./AppError";
import { toDbAppError } from "./appErrors";

type NegotiatedResponseType = "json" | "text" | "html";

type ClientErrorBody = {
    code: string;
    message: string;
    details?: unknown;
};

const SURFACEABLE_DB_ERROR_CODES = new Set<DbErrorCode>([
    DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN,
    DB_ERROR_CODES.DUPLICATE_ENTRY,
    DB_ERROR_CODES.VERSION_MISMATCH,
]);

const serializeClientError = (error: unknown, locale: Locale): ClientErrorBody => {
    if (error instanceof ZodError) {
        return {
            code: "VALIDATION_ERROR",
            message: translate(locale, "errors.validation"),
            details: error.flatten(),
        };
    }

    if (error instanceof AppError) {
        return {
            code: error.code,
            message: translate(locale, error.messageKey),
            ...(error.details !== undefined ? { details: error.details } : {}),
        };
    }

    if (error instanceof DbError && SURFACEABLE_DB_ERROR_CODES.has(error.publicError.code)) {
        const appError = toDbAppError(error.publicError);
        return {
            code: appError.code,
            message: translate(locale, appError.messageKey),
        };
    }

    return {
        code: "INTERNAL_SERVER_ERROR",
        message: translate(locale, "errors.internal"),
    };
};

const resolveClientErrorStatus = (error: unknown): number => {
    if (error instanceof ZodError) return 400;

    if (error instanceof AppError) return error.statusCode;

    if (error instanceof DbError && SURFACEABLE_DB_ERROR_CODES.has(error.publicError.code)) {
        return toDbAppError(error.publicError).statusCode;
    }

    return 500;
};

const negotiateResponseType = (req: Request): NegotiatedResponseType => {
    const acceptedType = req.accepts(["json", "html", "text"]);

    if (acceptedType === "json" || acceptedType === "html" || acceptedType === "text") {
        return acceptedType;
    }

    return "json";
};

const sendBody = (res: Response, status: number, type: NegotiatedResponseType, body: unknown): void => {
    if (type === "text") {
        res.status(status).type("text").send(formatTextBody(body));
        return;
    }

    if (type === "html") {
        res.status(status).type("html").send(formatHtmlBody(body));
        return;
    }

    res.status(status).json(body);
};

const formatTextBody = (body: unknown): string => {
    if (typeof body === "string") return body;

    return safeStringify(body);
};

const formatHtmlBody = (body: unknown): string => {
    if (typeof body === "string") return body;

    return `<pre>${escapeHtml(safeStringify(body))}</pre>`;
};

const safeStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value) ?? "";
    } catch {
        return "[Unserializable payload]";
    }
};

const escapeHtml = (value: string): string => {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

export {
    negotiateResponseType,
    resolveClientErrorStatus,
    sendBody,
    serializeClientError,
    type ClientErrorBody,
};
