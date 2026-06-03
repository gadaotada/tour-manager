import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  type ManagedUser,
} from "@tour-manager/shared";

import { useAuthUser } from "@core/stores";

function useUserPermissions() {
  const actor = useAuthUser();
  const canCreateEmployee = hasPermission(actor?.permissions, PERMISSIONS.USERS.CREATE_NON_ADMIN);
  const canReadAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.READ_ANY);
  const canUpdateAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.UPDATE_ANY);
  const canUpdateEmployee = hasPermission(actor?.permissions, PERMISSIONS.USERS.UPDATE_NON_ADMIN);
  const canDeleteAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.DELETE_ANY);
  const canDeleteEmployee = hasPermission(actor?.permissions, PERMISSIONS.USERS.DELETE_NON_ADMIN);

  function canUpdateUser(user: ManagedUser): boolean {
    if (user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
      return canUpdateAny;
    }

    return canUpdateAny || canUpdateEmployee;
  }

  function canDeleteUser(user: ManagedUser): boolean {
    if (actor?.id === user.id) return false;

    if (user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
      return canDeleteAny;
    }

    return canDeleteAny || canDeleteEmployee;
  }

  return {
    actor,
    canCreateEmployee,
    canDeleteAny,
    canDeleteEmployee,
    canDeleteUser,
    canManageAdmins: canUpdateAny,
    canReadAny,
    canUpdateAny,
    canUpdateEmployee,
    canUpdateUser,
  };
}

export { useUserPermissions };
