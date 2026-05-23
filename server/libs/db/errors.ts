import type { ErrorPacketParams } from "mysql2/promise";

const MYSQL_ERROR_CODES = {
  DUPLICATE_ENTRY: "ER_DUP_ENTRY",
  LOCK_DEADLOCK: "ER_LOCK_DEADLOCK",
  LOCK_WAIT_TIMEOUT: "ER_LOCK_WAIT_TIMEOUT",
} as const;

const DB_ERROR_CODES = {
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  NOT_FOUND_OR_FORBIDDEN: "NOT_FOUND_OR_FORBIDDEN",
  VERSION_MISMATCH: "VERSION_MISMATCH",
  TRANSIENT_DB_ERROR: "TRANSIENT_DB_ERROR",
  GENERAL_DB_ERROR: "DATABASE_ERROR",
} as const;

const DB_ERROR_MESSAGE_KEYS = {
  DUPLICATE_ENTRY: "errors.db.duplicateEntry",
  NOT_FOUND_OR_FORBIDDEN: "errors.db.notFound",
  VERSION_MISMATCH: "errors.db.versionMismatch",
  TRANSIENT_DB_ERROR: "errors.db.transient",
  GENERAL_DB_ERROR: "errors.db.general",
} as const satisfies Record<keyof typeof DB_ERROR_CODES, string>;

type MysqlErrorCode = (typeof MYSQL_ERROR_CODES)[keyof typeof MYSQL_ERROR_CODES];
type DbErrorCode = (typeof DB_ERROR_CODES)[keyof typeof DB_ERROR_CODES];
type DbErrorMessageKey =
  (typeof DB_ERROR_MESSAGE_KEYS)[keyof typeof DB_ERROR_MESSAGE_KEYS];

type PublicDbError = {
  statusCode: number;
  code: DbErrorCode;
  messageKey: DbErrorMessageKey;
  safeMessage: string;
  cause: unknown;
};

class DbError extends Error {
  public readonly name = "DbError";

  constructor(public readonly publicError: PublicDbError) {
    super(publicError.safeMessage);
  }
}

const getMysqlErrorCode = (error: unknown): string | null => {
  if (!error || typeof error !== "object") return null;
  const code = (error as Partial<ErrorPacketParams>).code;
  return typeof code === "string" ? code : null;
};

const hasMysqlErrorCode = (error: unknown, code: MysqlErrorCode): boolean => {
  return getMysqlErrorCode(error) === code;
};

const isDuplicateEntryError = (error: unknown): boolean => {
  return hasMysqlErrorCode(error, MYSQL_ERROR_CODES.DUPLICATE_ENTRY);
};

const isRetryableDbError = (error: unknown): boolean => {
  const code = getMysqlErrorCode(error);
  return (
    code === MYSQL_ERROR_CODES.LOCK_DEADLOCK ||
    code === MYSQL_ERROR_CODES.LOCK_WAIT_TIMEOUT
  );
};

const toPublicDbError = (error: unknown): PublicDbError => {
  if (isDuplicateEntryError(error)) {
    return {
      statusCode: 409,
      code: DB_ERROR_CODES.DUPLICATE_ENTRY,
      messageKey: DB_ERROR_MESSAGE_KEYS.DUPLICATE_ENTRY,
      safeMessage: "Duplicate database entry.",
      cause: error,
    };
  }

  if (isRetryableDbError(error)) {
    return {
      statusCode: 503,
      code: DB_ERROR_CODES.TRANSIENT_DB_ERROR,
      messageKey: DB_ERROR_MESSAGE_KEYS.TRANSIENT_DB_ERROR,
      safeMessage: "Temporary database conflict.",
      cause: error,
    };
  }

  return {
    statusCode: 500,
    code: DB_ERROR_CODES.GENERAL_DB_ERROR,
    messageKey: DB_ERROR_MESSAGE_KEYS.GENERAL_DB_ERROR,
    safeMessage: "Database operation failed.",
    cause: error,
  };
};

export {
  DB_ERROR_CODES,
  DB_ERROR_MESSAGE_KEYS,
  MYSQL_ERROR_CODES,
  DbError,
  type DbErrorCode,
  type DbErrorMessageKey,
  type PublicDbError,
  getMysqlErrorCode,
  hasMysqlErrorCode,
  isDuplicateEntryError,
  isRetryableDbError,
  toPublicDbError,
};
