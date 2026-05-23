import type { Request } from "express";
import type { ZodSchema } from "zod";

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

type ValidatedRequest<TSchemas extends RequestSchemas> = {
  body: TSchemas["body"] extends ZodSchema<infer T> ? T : never;
  params: TSchemas["params"] extends ZodSchema<infer T> ? T : never;
  query: TSchemas["query"] extends ZodSchema<infer T> ? T : never;
};

export function validateRequest<TSchemas extends RequestSchemas>(
  req: Request,
  schemas: TSchemas,
): ValidatedRequest<TSchemas> {
  return {
    body: schemas.body?.parse(req.body),
    params: schemas.params?.parse(req.params),
    query: schemas.query?.parse(req.query)
  } as ValidatedRequest<TSchemas>;
}
