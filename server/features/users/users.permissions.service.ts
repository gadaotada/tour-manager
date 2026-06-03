import {
  USER_REALTIME_EVENTS,
  type ClientUser,
  type UpdateUserPermissionsInput,
  type UserRealtimePayload,
  type UserPermissionOverride,
} from "@tour-manager/shared";

import { AppError } from "@core/http";
import { wsGateway } from "@core/realtime";
import { usersPermissionsRepository } from "./users.permissions.repository";
import { assertCanManagePermissions, canReadRole } from "./users.policy";
import { usersRepository } from "./users.repository";

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

  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "errors.db.notFound",
      "Record was not found.",
    );
  }

  assertCanManagePermissions(actor, user.role);

  const permission_overrides =
    await usersPermissionsRepository.replaceUserPermissionOverrides(
      user.id,
      payload.permission_overrides,
    );

  emitUserPermissionsUpdated(user.id, user.role, exclude_socket_id);

  return permission_overrides;
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
}

const usersPermissionsService = {
  updateUserPermissions,
};

export { usersPermissionsService };
