import type { RequestHandler, Response } from "express";
import { HTTP_HEADERS } from "@tour-manager/shared";

import { getRequestContext } from "@core/http";

import type { BaseContext, ProceedSignal } from "./public.types";
import { createReply } from "./reply";

type MutableBaseContext = BaseContext & Record<string, unknown> & {
    parsed?: unknown;
};

const RESERVED_CONTEXT_KEYS = new Set([
    "req",
    "res",
    "reply",
    "proceed",
    "logger",
    "requestId",
    "origin_socket_id",
    "parsed",
]);

const PROCEED_SIGNAL: ProceedSignal = {
    type: "proceed",
};

function createBaseContext(req: Parameters<RequestHandler>[0], res: Response): MutableBaseContext {
    const { logger, requestId } = getRequestContext(res);
    const origin_socket_id = req.header(HTTP_HEADERS.SOCKET_ID);

    return {
        req,
        res,
        reply: createReply(res),
        proceed: () => PROCEED_SIGNAL,
        logger,
        requestId,
        ...(origin_socket_id ? { origin_socket_id } : {}),
    };
}

function isProceedSignal(value: unknown): value is ProceedSignal {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        value.type === PROCEED_SIGNAL.type
    );
}

function mergeContext(ctx: MutableBaseContext, value: unknown): void {
    if (isProceedSignal(value)) return;
    if (!isContextPatch(value)) return;

    for (const [key, patchValue] of Object.entries(value)) {
        if (RESERVED_CONTEXT_KEYS.has(key)) throw new Error(`Cannot overwrite reserved context key "${key}".`);

        ctx[key] = patchValue;
    }
}

function isContextPatch(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export {
    type MutableBaseContext,
    createBaseContext,
    isProceedSignal,
    mergeContext,
};
