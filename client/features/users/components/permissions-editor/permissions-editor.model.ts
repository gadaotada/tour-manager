import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLES,
  type Permission,
  type UserDetail,
} from "@tour-manager/shared";

import type {
  OverrideValue,
  PermissionSortBy,
  PermissionSortDir,
  PermissionTableRow,
} from "./permissions-editor.types";

function toOverrideMap(user: UserDetail): Record<Permission, OverrideValue> {
  const map = Object.fromEntries(
    ALL_PERMISSIONS.map((permission) => [permission, "DEFAULT"]),
  ) as Record<Permission, OverrideValue>;

  for (const override of user.permission_overrides) {
    map[override.permission] = override.effect;
  }

  return map;
}

function toPermissionOverrides(overrides: Record<Permission, OverrideValue>) {
  return ALL_PERMISSIONS.flatMap((permission) => {
    const effect = overrides[permission];

    if (effect === "DEFAULT") {
      return [];
    }

    return [{ permission, effect }];
  });
}

function areOverrideMapsEqual(
  left: Record<Permission, OverrideValue>,
  right: Record<Permission, OverrideValue>,
): boolean {
  return ALL_PERMISSIONS.every((permission) => left[permission] === right[permission]);
}

function createPermissionRows({
  overrides,
  role,
  search,
  sortBy,
  sortDir,
}: {
  overrides: Record<Permission, OverrideValue>;
  role: UserDetail["role"];
  search: string;
  sortBy: PermissionSortBy;
  sortDir: PermissionSortDir;
}): PermissionTableRow[] {
  const normalizedSearch = search.trim().toLowerCase();
  const rolePermissions = ROLE_PERMISSIONS[role] as readonly Permission[];

  return ALL_PERMISSIONS
    .map((permission): PermissionTableRow => ({
      permission,
      defaultAllowed: rolePermissions.includes(permission),
      override: overrides[permission] ?? "DEFAULT",
    }))
    .filter((row) =>
      normalizedSearch.length === 0
        ? true
        : row.permission.toLowerCase().includes(normalizedSearch),
    )
    .sort((left, right) => comparePermissionRows(left, right, sortBy, sortDir));
}

function getCanManagePermissions({
  actorId,
  canUpdateAny,
  canUpdateNonAdmin,
  user,
}: {
  actorId: string | undefined;
  canUpdateAny: boolean;
  canUpdateNonAdmin: boolean;
  user: UserDetail;
}): boolean {
  if (!actorId || actorId === user.id || user.role === ROLES.ADMIN) {
    return false;
  }

  if (canUpdateAny) {
    return true;
  }

  return user.role === ROLES.EMPLOYEE && canUpdateNonAdmin;
}

function comparePermissionRows(
  left: PermissionTableRow,
  right: PermissionTableRow,
  sortBy: PermissionSortBy,
  sortDir: PermissionSortDir,
): number {
  const direction = sortDir === "ASC" ? 1 : -1;

  if (sortBy === "default") {
    return compareStrings(
      left.defaultAllowed ? "allowed" : "denied",
      right.defaultAllowed ? "allowed" : "denied",
    ) * direction;
  }

  if (sortBy === "override") {
    return compareStrings(left.override, right.override) * direction;
  }

  return compareStrings(left.permission, right.permission) * direction;
}

function compareStrings(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

export {
  areOverrideMapsEqual,
  createPermissionRows,
  getCanManagePermissions,
  toOverrideMap,
  toPermissionOverrides,
};
