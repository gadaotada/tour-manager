import type { Logger } from "@tour-manager/shared";
import type { Request, Response } from "express";
import { z, type ZodTypeAny } from "zod";

import type { RequestSchemas } from "@core/validation";

type NegotiatedResponseType = "json" | "text" | "html";

type AppDataPayload = {
    data: unknown;
    type?: NegotiatedResponseType;
};

type AppErrorPayload = {
    error: Error;
    type?: NegotiatedResponseType;
};

type AppResponsePayload = AppDataPayload | AppErrorPayload;

interface AppResponse {
    success: (payload: AppDataPayload) => void;
    created: (payload: AppDataPayload) => void;
    noContent: () => void;
    error: (payload: AppErrorPayload) => void;
    notFound: (type?: NegotiatedResponseType) => void;
    badRequest: (payload: AppErrorPayload) => void;
    unauthorized: (type?: NegotiatedResponseType) => void;
    forbidden: (type?: NegotiatedResponseType) => void;
    internalServerError: (type?: NegotiatedResponseType) => void;
}

type ParsedRequest<S extends RequestSchemas> = {
    [K in keyof S as S[K] extends ZodTypeAny ? K : never]: S[K] extends ZodTypeAny ? z.infer<S[K]> : never;
};

type ProceedSignal = {
    readonly type: "proceed";
};

type BaseContext = {
    req: Request;
    res: Response;
    reply: AppResponse;
    proceed: () => ProceedSignal;
    logger: Logger;
    requestId: string;
    originSocketId?: string;
};

type HandlerContext<Extra = object, Schemas = undefined> = BaseContext &
    Extra &
    (Schemas extends RequestSchemas ? { parsed: ParsedRequest<Schemas> } : object);

type AppMiddleware<Adds = object, Extra = object> = (
    ctx: HandlerContext<Extra>,
) => Adds | ProceedSignal | void | Promise<Adds | ProceedSignal | void>;

type RouteMiddleware<
    Adds = object,
    Extra = object,
    Schemas extends RequestSchemas | undefined = undefined,
> = (ctx: HandlerContext<Extra, Schemas>) => Adds | ProceedSignal | void | Promise<Adds | ProceedSignal | void>;

type RouteHandler<
    Schemas extends RequestSchemas | undefined = undefined,
    Extra = object,
> = (ctx: HandlerContext<Extra, Schemas>) => unknown | Promise<unknown>;

type RoutePipelineStep = (
    ctx: HandlerContext<object, RequestSchemas | undefined>,
) => unknown | Promise<unknown>;

export {
    type AppDataPayload,
    type AppErrorPayload,
    type AppMiddleware,
    type AppResponse,
    type AppResponsePayload,
    type BaseContext,
    type HandlerContext,
    type NegotiatedResponseType,
    type ParsedRequest,
    type ProceedSignal,
    type RequestSchemas,
    type RouteHandler,
    type RouteMiddleware,
    type RoutePipelineStep,
};
