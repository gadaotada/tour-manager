import {
  isPermission,
  isPermissionEffect,
  type PermissionOverride,
  type UserPermissionOverride,
} from "@tour-manager/shared";

import { DbError, query, transaction } from "@libs/db";

type PermissionOverrideRow = {
  effect: string;
  permission: string;
  user_id: string;
};

async function listUserPermissionOverrides(userId: string): Promise<UserPermissionOverride[]> {
  return query(async (qe) => {
    const rows = await qe.read<PermissionOverrideRow>(
      "execute",
      `
        SELECT user_id, permission, effect
        FROM user_permission_overrides
        WHERE user_id = ?
        ORDER BY permission ASC
      `,
      [userId],
    );

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
  });
}

async function replaceUserPermissionOverrides(
  userId: string,
  overrides: readonly PermissionOverride[],
): Promise<UserPermissionOverride[]> {
  return transaction(async (qe) => {
    const deleteMutation = await qe.mutate(
      "execute",
      "DELETE FROM user_permission_overrides WHERE user_id = ?",
      [userId],
    );

    if (!deleteMutation.ok) throw new DbError(deleteMutation.error);

    if (overrides.length > 0) {
      const placeholders = overrides.map(() => "(?, ?, ?)").join(", ");
      const values = overrides.flatMap((override) => [
        userId,
        override.permission,
        override.effect,
      ]);

      const insertMutation = await qe.mutate(
        "execute",
        `
          INSERT INTO user_permission_overrides (user_id, permission, effect)
          VALUES ${placeholders}
        `,
        values,
      );

      if (!insertMutation.ok) throw new DbError(insertMutation.error);
    }

    return overrides.map((override) => ({
      user_id: userId,
      permission: override.permission,
      effect: override.effect,
    }));
  });
}

const usersPermissionsRepository = {
  listUserPermissionOverrides,
  replaceUserPermissionOverrides,
};

export { usersPermissionsRepository };
