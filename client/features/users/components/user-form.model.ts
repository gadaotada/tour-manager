import { ROLES, type Role } from "@tour-manager/shared";

const USER_FORM_FIELDS = [
  "username",
  "display_name",
  "role",
  "is_enabled",
  "password",
] as const;

function getRoleOptions(canManageAdminUsers: boolean): Role[] {
  return canManageAdminUsers
    ? [ROLES.ADMIN, ROLES.MODERATOR, ROLES.EMPLOYEE]
    : [ROLES.MODERATOR, ROLES.EMPLOYEE];
}

export { USER_FORM_FIELDS, getRoleOptions };
