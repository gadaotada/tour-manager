import type { ExecuteValues, ResultSetHeader } from "mysql2/promise";

import {
  DbError,
  DB_ERROR_CODES,
  DB_ERROR_MESSAGE_KEYS,
  type PublicDbError,
} from "./errors";
import { QUERY_MODE, type QueryEngine, type QueryMode } from "./query";

type VersionRow = {
  version: number;
};

type OptimisticMutationMiss =
  | typeof DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN
  | typeof DB_ERROR_CODES.VERSION_MISMATCH;

type OptimisticMutationOptions = {
  mode?: QueryMode;
  sql: string;
  values?: ExecuteValues;
  probeSql: string;
  probeValues?: ExecuteValues;
};

const hasAffectedRows = (result: ResultSetHeader): boolean => {
  return result.affectedRows > 0;
};

const classifyOptimisticMutationMiss = async (
  qe: QueryEngine,
  sql: string,
  values?: ExecuteValues,
): Promise<OptimisticMutationMiss> => {
  const probe = await qe.read<VersionRow>(QUERY_MODE.execute, sql, values, {
    shouldThrow: true,
  });

  if (!probe.ok || probe.rows.length === 0) {
    return DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN;
  }

  return DB_ERROR_CODES.VERSION_MISMATCH;
};

const toOptimisticMutationError = (miss: OptimisticMutationMiss): PublicDbError => {
  if (miss === DB_ERROR_CODES.VERSION_MISMATCH) {
    return {
      statusCode: 409,
      code: miss,
      messageKey: DB_ERROR_MESSAGE_KEYS.VERSION_MISMATCH,
      safeMessage: "Record was modified by another operation.",
      cause: null,
    };
  }

  return {
    statusCode: 404,
    code: miss,
    messageKey: DB_ERROR_MESSAGE_KEYS.NOT_FOUND_OR_FORBIDDEN,
    safeMessage: "Record was not found.",
    cause: null,
  };
};

const mutateWithVersion = async (
  qe: QueryEngine,
  options: OptimisticMutationOptions,
): Promise<ResultSetHeader> => {
  const mutation = await qe.mutate(
    options.mode ?? QUERY_MODE.execute,
    options.sql,
    options.values,
    { shouldThrow: true },
  );

  if (!mutation.ok) {
    throw mutation.error;
  }

  if (hasAffectedRows(mutation.result)) {
    return mutation.result;
  }

  const miss = await classifyOptimisticMutationMiss(
    qe,
    options.probeSql,
    options.probeValues,
  );

  throw new DbError(toOptimisticMutationError(miss));
};

export {
  type OptimisticMutationMiss,
  type OptimisticMutationOptions,
  type VersionRow,
  classifyOptimisticMutationMiss,
  hasAffectedRows,
  mutateWithVersion,
  toOptimisticMutationError,
};
