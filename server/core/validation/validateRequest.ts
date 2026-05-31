import type { Request } from "express";
import { z } from "zod";
import type { ZodSchema, ZodTypeAny } from "zod";

export type RequestSchemas = {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
};

type InferOutput<T> = T extends ZodTypeAny ? z.infer<T> : never;

type ValidatedRequest<TSchemas extends RequestSchemas> = {
    body: InferOutput<TSchemas["body"]>;
    params: InferOutput<TSchemas["params"]>;
    query: InferOutput<TSchemas["query"]>;
};

function validateRequest<TSchemas extends RequestSchemas>(
    req: Request,
    schemas: TSchemas,
): ValidatedRequest<TSchemas> {
    return {
        body: schemas.body?.parse(req.body),
        params: schemas.params?.parse(req.params),
        query: schemas.query?.parse(req.query),
    } as ValidatedRequest<TSchemas>;
}

export { validateRequest };
