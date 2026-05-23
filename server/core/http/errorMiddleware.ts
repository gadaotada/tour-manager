import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { resolveLocale, translate } from "@libs/i18n";
import { AppError } from "./AppError";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  const locale = resolveLocale(req);

  if (error instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: translate(locale, "errors.validation"),
        details: error.flatten()
      }
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code,
        message: translate(locale, error.messageKey),
        details: error.details
      }
    });
    return;
  }

  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: translate(locale, "errors.internal")
    }
  });
};
