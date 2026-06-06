import {
  ROLES,
  USER_SORT_BY_COLS,
  isPermission,
  isPermissionEffect,
  type CreateUserInput,
  type ListUsersQuery,
  type ManagedUser,
  type Role,
  type UpdateUserInput,
  type UserDetail,
  type UserPermissionOverride,
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

type PermissionOverrideRow = {
  effect: string;
  permission: string;
  user_id: string;
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

type UserChangeResult = {
  before: ManagedUser;
  after: ManagedUser;
};

const MANAGED_USER_SELECT_SQL = `
  SELECT id, username, display_name, role, is_enabled, created_at, updated_at
  FROM users
  WHERE id = ?
  LIMIT 1
`;

const MANAGED_USER_SELECT_FOR_UPDATE_SQL = `
  SELECT id, username, display_name, role, is_enabled, created_at, updated_at
  FROM users
  WHERE id = ?
  LIMIT 1
  FOR UPDATE
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

async function findUserDetailById(userId: string): Promise<UserDetail | undefined> {
  return query(async (qe) => {
    const rows = await qe.read<UserRow>(
      "execute",
      MANAGED_USER_SELECT_SQL,
      [userId],
    );
    const row = rows[0];

    if (!row) {
      return undefined;
    }

    const permissionRows = await qe.read<PermissionOverrideRow>(
      "execute",
      `
        SELECT user_id, permission, effect
        FROM user_permission_overrides
        WHERE user_id = ?
        ORDER BY permission ASC
      `,
      [userId],
    );

    return {
      ...toManagedUser(row),
      permission_overrides: toUserPermissionOverrides(permissionRows),
    };
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

async function updateUserForTarget(
  payload: UpdateUserRecord,
  assertCanUpdateExisting: (role: Role) => void,
  assertCanUpdateNext: (role: Role) => void,
): Promise<UserChangeResult> {
  return transaction(async (qe) => {
    const beforeRows = await qe.read<UserRow>(
      "execute",
      MANAGED_USER_SELECT_FOR_UPDATE_SQL,
      [payload.id],
    );
    const beforeRow = beforeRows[0];

    if (!beforeRow) throw createNotFoundError();

    const before = toManagedUser(beforeRow);
    assertCanUpdateExisting(before.role);
    assertCanUpdateNext(payload.role);

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

    return {
      before,
      after: toManagedUser(row),
    };
  });
}

async function updateUserStatusForTarget(
  userId: string,
  isEnabled: boolean,
  assertCanUpdate: (role: Role) => void,
): Promise<UserChangeResult> {
  return transaction(async (qe) => {
    const beforeRows = await qe.read<UserRow>(
      "execute",
      MANAGED_USER_SELECT_FOR_UPDATE_SQL,
      [userId],
    );
    const beforeRow = beforeRows[0];

    if (!beforeRow) throw createNotFoundError();

    const before = toManagedUser(beforeRow);
    assertCanUpdate(before.role);

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

    return {
      before,
      after: toManagedUser(row),
    };
  });
}

async function deleteUserForTarget(
  userId: string,
  assertCanDelete: (role: Role) => void,
): Promise<ManagedUser> {
  return transaction(async (qe) => {
    const beforeRows = await qe.read<UserRow>(
      "execute",
      MANAGED_USER_SELECT_FOR_UPDATE_SQL,
      [userId],
    );
    const beforeRow = beforeRows[0];

    if (!beforeRow) throw createNotFoundError();

    const before = toManagedUser(beforeRow);
    assertCanDelete(before.role);

    const mutation = await qe.mutate("execute", "DELETE FROM users WHERE id = ?;", [userId]);

    if (!mutation.ok) throw new DbError(mutation.error);
    if (mutation.result.affectedRows === 0) throw createNotFoundError();

    return before;
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

function toUserPermissionOverrides(rows: PermissionOverrideRow[]): UserPermissionOverride[] {
  return rows.flatMap((row) => {
    if (!isPermission(row.permission) || !isPermissionEffect(row.effect)) {
      return [];
    }

    return [{
      user_id: row.user_id,
      permission: row.permission,
      effect: row.effect,
    }];
  });
}

const usersRepository = {
  createUser,
  deleteUserForTarget,
  findUserDetailById,
  listUsers,
  updateUserForTarget,
  updateUserStatusForTarget,
};

export { usersRepository };
