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

async function findUserByUsername(username: string): Promise<UserRow | null> {
  return findUser(
    `
      SELECT id, username, password_hash, display_name, role, is_enabled, settings
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username],
  );
}

async function findUserById(userId: string): Promise<UserRow | null> {
  return findUser(
    `
      SELECT id, username, password_hash, display_name, role, is_enabled, settings
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );
}

async function findUserPermissionOverrides(
  userId: string,
): Promise<PermissionOverride[]> {
  return query(async (qe) => {
    const rows = await qe.read<PermissionOverrideRow>(
      "execute",
      `
        SELECT permission, effect
        FROM user_permission_overrides
        WHERE user_id = ?
      `,
      [userId],
    );

    return rows.flatMap((row) => {
      if (!isPermission(row.permission) || !isPermissionEffect(row.effect)) {
        return [];
      }

      return [{ permission: row.permission, effect: row.effect }];
    });
  });
}

async function findUser(sql: string, values: ExecuteValues): Promise<UserRow | null> {
  return query(async (qe) => {
    const rows = await qe.read<UserRow>("execute", sql, values);

    return rows[0] ?? null;
  });
}

const authRepository = {
  findUserById,
  findUserByUsername,
  findUserPermissionOverrides,
};

export { authRepository, type UserRow };
