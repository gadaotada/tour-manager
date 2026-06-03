import {
  ROLES,
  USER_SORT_BY_COLS,
  type CreateUserInput,
  type ListUsersQuery,
  type ManagedUser,
  type UpdateUserInput,
} from "@tour-manager/shared";

import {
  DB_ERROR_CODES,
  DB_ERROR_MESSAGE_KEYS,
  DbError,
  buildGeneralPaginatedSelectSql,
  query,
  transaction,
} from "@libs/db";
import type { ExecuteValues } from "mysql2";

type UserRow = Omit<ManagedUser, "is_enabled"> & {
  is_enabled: number | boolean;
};

type CreateUserRecord = CreateUserInput & {
  id: string;
  password_hash: string;
};

type UpdateUserRecord = Omit<UpdateUserInput, "password"> & {
  password_hash?: string;
};

type ListUsersOptions = {
  includeAdmins: boolean;
  queryParams: ListUsersQuery;
};

const MANAGED_USER_SELECT_SQL = `
  SELECT id, username, display_name, role, is_enabled, created_at, updated_at
  FROM users
  WHERE id = ?
  LIMIT 1
`;

function toManagedUser(row: UserRow): ManagedUser {
  return {
    ...row,
    is_enabled: Boolean(row.is_enabled),
  };
}

async function listUsers({ includeAdmins, queryParams }: ListUsersOptions) {
  const filters: Array<{
    column: string;
    operator?: "=" | "<>";
    value: string | number | boolean;
  }> = [];

  if (queryParams.role !== undefined) {
    filters.push({ column: "role", value: queryParams.role });
  }

  if (queryParams.is_enabled !== undefined) {
    filters.push({ column: "is_enabled", value: queryParams.is_enabled });
  }

  if (!includeAdmins) {
    filters.push({ column: "role", operator: "<>", value: ROLES.ADMIN });
  }

  const { sql, values, countSql, countValues } = buildGeneralPaginatedSelectSql(
    "users",
    ["id", ...USER_SORT_BY_COLS],
    {
      page: queryParams.page,
      page_size: queryParams.page_size,
      searchBy: ["username", "display_name"],
      searchValue: queryParams.search,
      sort_by: queryParams.sort_by,
      sort_dir: queryParams.sort_dir,
      filters,
    },
  );

  return query(async (qe) => {
    const rows = await qe.read<UserRow>("execute", sql, values);
    const count = await qe.read<{ total: number }>("execute", countSql, countValues);

    return {
      rows: rows.map(toManagedUser),
      total: count[0]?.total ?? 0,
    };
  });
}

async function findUserById(userId: string): Promise<ManagedUser | undefined> {
  return query(async (qe) => {
    const rows = await qe.read<UserRow>(
      "execute",
      MANAGED_USER_SELECT_SQL,
      [userId],
    );
    const row = rows[0];

    return row ? toManagedUser(row) : undefined;
  });
}

async function createUser(payload: CreateUserRecord): Promise<ManagedUser> {
  return transaction(async (qe) => {
    const mutation = await qe.mutate<UserRow>(
      "execute",
      `
        INSERT INTO users (id, username, password_hash, display_name, role, is_enabled)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id, username, display_name, role, is_enabled, created_at, updated_at
      `,
      [
        payload.id,
        payload.username,
        payload.password_hash,
        payload.display_name,
        payload.role,
        payload.is_enabled,
      ],
    );

    if (!mutation.ok) throw new DbError(mutation.error);
    if (!mutation.rows?.[0]) throw createNotFoundError();

    return toManagedUser(mutation.rows[0]);
  });
}

async function updateUser(payload: UpdateUserRecord): Promise<ManagedUser> {
  return transaction(async (qe) => {
    const assignments = ["username = ?", "display_name = ?", "role = ?", "is_enabled = ?"];
    const values: ExecuteValues = [
      payload.username,
      payload.display_name,
      payload.role,
      payload.is_enabled,
    ];

    if (payload.password_hash) {
      assignments.push("password_hash = ?");
      values.push(payload.password_hash);
    }

    values.push(payload.id);

    const mutation = await qe.mutate(
      "execute",
      `
        UPDATE users
        SET ${assignments.join(", ")}
        WHERE id = ?
      `,
      values,
    );

    if (!mutation.ok) throw new DbError(mutation.error);

    const rows = await qe.read<UserRow>("execute", MANAGED_USER_SELECT_SQL, [payload.id]);
    const row = rows[0];

    if (!row) throw createNotFoundError();

    return toManagedUser(row);
  });
}

async function updateUserStatus(userId: string, isEnabled: boolean): Promise<ManagedUser> {
  return transaction(async (qe) => {
    const mutation = await qe.mutate(
      "execute",
      `
        UPDATE users
        SET is_enabled = ?
        WHERE id = ?
      `,
      [isEnabled, userId],
    );

    if (!mutation.ok) throw new DbError(mutation.error);

    const rows = await qe.read<UserRow>("execute", MANAGED_USER_SELECT_SQL, [userId]);
    const row = rows[0];

    if (!row) throw createNotFoundError();

    return toManagedUser(row);
  });
}

async function deleteUser(userId: string) {
  return transaction(async (qe) => {
    const mutation = await qe.mutate("execute", "DELETE FROM users WHERE id = ?;", [userId]);

    if (!mutation.ok) throw new DbError(mutation.error);
    if (mutation.result.affectedRows === 0) throw createNotFoundError();

    return mutation;
  });
}

function createNotFoundError(): DbError {
  return new DbError({
    statusCode: 404,
    code: DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN,
    messageKey: DB_ERROR_MESSAGE_KEYS.NOT_FOUND_OR_FORBIDDEN,
    safeMessage: "Record was not found.",
    cause: null,
  });
}

const usersRepository = {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
  updateUserStatus,
};

export { usersRepository };
