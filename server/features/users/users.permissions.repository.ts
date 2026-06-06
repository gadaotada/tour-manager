import {
  isPermission,
  isPermissionEffect,
  isRole,
  type PermissionOverride,
  type Role,
  type UserPermissionOverride,
} from "@tour-manager/shared";

import {
  DB_ERROR_CODES,
  DB_ERROR_MESSAGE_KEYS,
  DbError,
  transaction,
} from "@libs/db";

type PermissionOverrideRow = {
  effect: string;
  permission: string;
  user_id: string;
};

type UserRoleRow = {
  id: string;
  role: string;
};

type ReplaceUserPermissionOverridesResult = {
  before_permission_overrides: UserPermissionOverride[];
  permission_overrides: UserPermissionOverride[];
  role: Role;
};

async function replaceUserPermissionOverridesForTarget(
  userId: string,
  overrides: readonly PermissionOverride[],
  assertCanReplace: (role: Role) => void,
): Promise<ReplaceUserPermissionOverridesResult | null> {
  return transaction(async (qe) => {
    const userRows = await qe.read<UserRoleRow>(
      "execute",
      `
        SELECT id, role
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId],
    );
    const user = userRows[0];

    if (!user) {
      return null;
    }

    if (!isRole(user.role)) {
      throw createInvalidRoleError();
    }

    assertCanReplace(user.role);

    const existingRows = await qe.read<PermissionOverrideRow>(
      "execute",
      `
        SELECT user_id, permission, effect
        FROM user_permission_overrides
        WHERE user_id = ?
        ORDER BY permission ASC
      `,
      [userId],
    );

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

    return {
      role: user.role,
      before_permission_overrides: toUserPermissionOverrides(existingRows),
      permission_overrides: toUserPermissionOverrides(
        overrides.map((override) => ({
          user_id: userId,
          permission: override.permission,
          effect: override.effect,
        })),
      ),
    };
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

function createInvalidRoleError(): DbError {
  return new DbError({
    statusCode: 500,
    code: DB_ERROR_CODES.GENERAL_DB_ERROR,
    messageKey: DB_ERROR_MESSAGE_KEYS.GENERAL_DB_ERROR,
    safeMessage: "Database operation failed.",
    cause: null,
  });
}

const usersPermissionsRepository = {
  replaceUserPermissionOverridesForTarget,
};

export { usersPermissionsRepository };
