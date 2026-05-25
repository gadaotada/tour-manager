import { AppError } from "./AppError";

function invalidCredentialsError(): AppError {
  return new AppError(
    401,
    "INVALID_CREDENTIALS",
    "errors.auth.invalidCredentials",
    "Invalid username or password.",
  );
}

function disabledUserError(): AppError {
  return new AppError(
    403,
    "USER_DISABLED",
    "errors.auth.disabledUser",
    "This user account is disabled.",
  );
}

function unauthenticatedError(): AppError {
  return new AppError(
    401,
    "UNAUTHENTICATED",
    "errors.auth.unauthenticated",
    "You must be signed in.",
  );
}

function forbiddenError(): AppError {
  return new AppError(
    403,
    "FORBIDDEN",
    "errors.auth.forbidden",
    "You do not have permission to perform this action.",
  );
}

export {
  disabledUserError,
  forbiddenError,
  invalidCredentialsError,
  unauthenticatedError,
};
