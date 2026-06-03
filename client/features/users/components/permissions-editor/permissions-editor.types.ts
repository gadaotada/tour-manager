import type { Permission, PermissionEffect } from "@tour-manager/shared";

type OverrideValue = "DEFAULT" | PermissionEffect;
type PermissionSortBy = "permission" | "default" | "override";
type PermissionSortDir = "ASC" | "DESC";

type PermissionTableRow = {
  defaultAllowed: boolean;
  override: OverrideValue;
  permission: Permission;
};

export type { OverrideValue, PermissionSortBy, PermissionSortDir, PermissionTableRow };
