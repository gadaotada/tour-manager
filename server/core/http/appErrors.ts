import type { PublicDbError } from "@libs/db";

import { AppError } from "./AppError";

const toDbAppError = (error: PublicDbError): AppError => {
  return new AppError(
    error.statusCode,
    error.code,
    error.messageKey,
    error.safeMessage,
  );
};

export { toDbAppError };
