import {
  USER_REALTIME_EVENTS,
  type ClientUser,
  type UpdateUserPermissionsInput,
  type UserRealtimePayload,
  type UserPermissionOverride,
  AUTH_REALTIME_EVENTS,
} from "@tour-manager/shared";

import { AppError } from "@core/http";
import { wsGateway } from "@core/realtime";
import { usersPermissionsRepository } from "./users.permissions.repository";
import { assertCanManagePermissions, canReadRole } from "./users.policy";
import { AuditLog } from "@libs/audit";

async function updateUserPermissions(
  actor: ClientUser,
  userId: string,
  payload: UpdateUserPermissionsInput,
  exclude_socket_id: string | undefined,
): Promise<UserPermissionOverride[]> {
  if (actor.id === userId) {
    throw new AppError(
      400,
      "SELF_PERMISSION_UPDATE_NOT_ALLOWED",
      "errors.users.selfPermissionUpdate",
      "You cannot update your own permissions.",
    );
  }

  const result = await usersPermissionsRepository.replaceUserPermissionOverridesForTarget(
    userId,
    payload.permission_overrides,
    (role) => assertCanManagePermissions(actor, role),
  );

  if (!result) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "errors.db.notFound",
      "Record was not found.",
    );
  }

  emitUserPermissionsUpdated(userId, result.role, exclude_socket_id);

  AuditLog.record("UPDATE", {
    user_id: actor.id,
    resource: "USERS",
    resource_id: userId,
    data: {
      before: {
        permission_overrides: result.before_permission_overrides.map(({ permission, effect }) => ({
          permission,
          effect,
        })),
      },
      after: {
        permission_overrides: payload.permission_overrides,
      },
    },
  });

  return result.permission_overrides;
}

function emitUserPermissionsUpdated(
  userId: string,
  role: ClientUser["role"],
  exclude_socket_id: string | undefined,
): void {
  const payload: UserRealtimePayload = {
    event: USER_REALTIME_EVENTS.UPDATE,
    data: { id: userId },
  };

  wsGateway.emitToScope("users", payload, {
    exclude_socket_id,
    filter: (viewer) => canReadRole(viewer, role),
  });

  wsGateway.emitToUser(userId, {
    event: AUTH_REALTIME_EVENTS.SESSION_CHANGE,
    data: { reason: "permissions_changed" },
  });
}

const usersPermissionsService = {
  updateUserPermissions,
};

export { usersPermissionsService };
