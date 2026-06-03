import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  type ManagedUser,
} from "@tour-manager/shared";

import { useAuthUser } from "@core/stores";

function useUserPermissions() {
  const actor = useAuthUser();
  const canCreateAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.CREATE_ANY);
  const canCreateNonAdmin = hasPermission(actor?.permissions, PERMISSIONS.USERS.CREATE_NON_ADMIN);
  const canReadAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.READ_ANY);
  const canReadNonAdmin = hasPermission(actor?.permissions, PERMISSIONS.USERS.READ_NON_ADMIN);
  const canUpdateAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.UPDATE_ANY);
  const canUpdateNonAdmin = hasPermission(actor?.permissions, PERMISSIONS.USERS.UPDATE_NON_ADMIN);
  const canDeleteAny = hasPermission(actor?.permissions, PERMISSIONS.USERS.DELETE_ANY);
  const canDeleteNonAdmin = hasPermission(actor?.permissions, PERMISSIONS.USERS.DELETE_NON_ADMIN);

  function canUpdateUser(user: ManagedUser): boolean {
    if (user.role === ROLES.ADMIN) {
      return canUpdateAny;
    }

    return canUpdateAny || canUpdateNonAdmin;
  }

  function canDeleteUser(user: ManagedUser): boolean {
    if (actor?.id === user.id) return false;

    if (user.role === ROLES.ADMIN) {
      return canDeleteAny;
    }

    return canDeleteAny || canDeleteNonAdmin;
  }

  return {
    actor,
    canCreateAny,
    canCreateNonAdmin,
    canDeleteAny,
    canDeleteNonAdmin,
    canDeleteUser,
    canCreateUser: canCreateAny || canCreateNonAdmin,
    canReadAdminUsers: canReadAny,
    canReadAny,
    canReadNonAdmin,
    canUpdateAny,
    canUpdateNonAdmin,
    canUpdateUser,
  };
}

export { useUserPermissions };
