import type { ExecuteValues } from "mysql2";
import type { PermissionOverride } from "@tour-manager/shared";
import { isPermission, isPermissionEffect } from "@tour-manager/shared";

import { query } from "@libs/db";

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: string;
  is_enabled: number | boolean;
  settings: string | null;
};

type PermissionOverrideRow = {
  permission: string;
  effect: string;
};

type UserWithPermissionOverrides = {
  user: UserRow;
  permission_overrides: PermissionOverride[];
};

async function findUserWithPermissionsByUsername(
  username: string,
): Promise<UserWithPermissionOverrides | null> {
  return findUserWithPermissionOverrides(
    `
      SELECT id, username, password_hash, display_name, role, is_enabled, settings
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username],
  );
}

async function findUserWithPermissionsById(
  userId: string,
): Promise<UserWithPermissionOverrides | null> {
  return findUserWithPermissionOverrides(
    `
      SELECT id, username, password_hash, display_name, role, is_enabled, settings
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );
}

async function findUserWithPermissionOverrides(
  sql: string,
  values: ExecuteValues,
): Promise<UserWithPermissionOverrides | null> {
  return query(async (qe) => {
    const rows = await qe.read<UserRow>("execute", sql, values);
    const user = rows[0];

    if (!user) {
      return null;
    }

    const permissionRows = await qe.read<PermissionOverrideRow>(
      "execute",
      `
        SELECT permission, effect
        FROM user_permission_overrides
        WHERE user_id = ?
      `,
      [user.id],
    );

    return {
      user,
      permission_overrides: toPermissionOverrides(permissionRows),
    };
  });
}

function toPermissionOverrides(rows: PermissionOverrideRow[]): PermissionOverride[] {
  return rows.flatMap((row) => {
    if (!isPermission(row.permission) || !isPermissionEffect(row.effect)) {
      return [];
    }

    return [{ permission: row.permission, effect: row.effect }];
  });
}

const authRepository = {
  findUserWithPermissionsById,
  findUserWithPermissionsByUsername,
};

export { authRepository, type UserRow };
