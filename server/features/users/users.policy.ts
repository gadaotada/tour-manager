import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  type ClientUser,
  type Role,
} from "@tour-manager/shared";

import { forbiddenError } from "@core/http";

function assertCanReadRole(actor: ClientUser, role: Role): void {
  if (hasPermission(actor.permissions, PERMISSIONS.USERS.READ_ANY)) return;

  if (
    isNonAdminRole(role) &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.READ_NON_ADMIN)
  ) {
    return;
  }

  throw forbiddenError();
}

function assertCanCreateRole(actor: ClientUser, role: Role): void {
  if (hasPermission(actor.permissions, PERMISSIONS.USERS.CREATE_ANY)) return;

  if (
    isNonAdminRole(role) &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.CREATE_NON_ADMIN)
  ) {
    return;
  }

  throw forbiddenError();
}

function assertCanUpdateRole(actor: ClientUser, role: Role): void {
  if (hasPermission(actor.permissions, PERMISSIONS.USERS.UPDATE_ANY)) return;

  if (
    isNonAdminRole(role) &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.UPDATE_NON_ADMIN)
  ) {
    return;
  }

  throw forbiddenError();
}

function assertCanDeleteRole(actor: ClientUser, role: Role): void {
  if (hasPermission(actor.permissions, PERMISSIONS.USERS.DELETE_ANY)) return;

  if (
    isNonAdminRole(role) &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.DELETE_NON_ADMIN)
  ) {
    return;
  }

  throw forbiddenError();
}

function assertCanManagePermissions(actor: ClientUser, targetRole: Role): void {
  if (targetRole === ROLES.ADMIN) {
    throw forbiddenError();
  }

  if (hasPermission(actor.permissions, PERMISSIONS.USERS.UPDATE_ANY)) return;

  if (
    targetRole === ROLES.EMPLOYEE &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.UPDATE_NON_ADMIN)
  ) {
    return;
  }

  throw forbiddenError();
}

function canReadRole(actor: ClientUser, role: Role): boolean {
  if (hasPermission(actor.permissions, PERMISSIONS.USERS.READ_ANY)) {
    return true;
  }

  return (
    isNonAdminRole(role) &&
    hasPermission(actor.permissions, PERMISSIONS.USERS.READ_NON_ADMIN)
  );
}

function isNonAdminRole(role: Role): boolean {
  return role !== ROLES.ADMIN;
}

export {
  assertCanCreateRole,
  assertCanDeleteRole,
  assertCanManagePermissions,
  assertCanReadRole,
  assertCanUpdateRole,
  canReadRole,
};
