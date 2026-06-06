import { randomUUID } from "node:crypto";

import { hash } from "argon2";
import {
  PERMISSIONS,
  ROLES,
  USER_REALTIME_EVENTS,
  hasPermission,
  type ClientUser,
  type CreateUserInput,
  type ListUsersQuery,
  type ManagedUser,
  type UpdateUserInput,
  type UserRealtimePayload,
  type UsersListResult,
} from "@tour-manager/shared";

import { wsGateway } from "@core/realtime";
import { AppError, forbiddenError } from "@core/http";
import { buildPaginatedResult } from "@libs/db";
import {
  assertCanCreateRole,
  assertCanDeleteRole,
  assertCanReadRole,
  assertCanUpdateRole,
  canReadRole,
} from "./users.policy";
import { usersRepository } from "./users.repository";
import { AuditLog } from "@libs/audit";

function emitUserEvent(
  event: UserRealtimePayload["event"],
  userId: string,
  visibleRoles: readonly ManagedUser["role"][],
  exclude_socket_id: string | undefined,
): void {
  const payload: UserRealtimePayload = {
    event,
    data: {
      id: userId,
    },
  };

  wsGateway.emitToScope("users", payload, {
    exclude_socket_id,
    filter: (viewer) => visibleRoles.some((role) => canReadRole(viewer, role)),
  });
}

async function listUsers(
  actor: ClientUser,
  query: ListUsersQuery,
): Promise<UsersListResult> {
  const includeAdmins = hasPermission(actor.permissions, PERMISSIONS.USERS.READ_ANY);
  const canReadNonAdmin = hasPermission(actor.permissions, PERMISSIONS.USERS.READ_NON_ADMIN);

  if (!includeAdmins && !canReadNonAdmin) {
    throw forbiddenError();
  }

  const sanitizedQuery =
    includeAdmins || query.role !== ROLES.ADMIN ? query : { ...query, role: undefined };
  const { rows, total } = await usersRepository.listUsers({
    includeAdmins,
    queryParams: sanitizedQuery,
  });

  return buildPaginatedResult({
    page: query.page,
    page_size: query.page_size,
    total,
    data: rows,
    query: sanitizedQuery
  });
}

async function createUser(
  actor: ClientUser,
  payload: CreateUserInput,
  exclude_socket_id: string | undefined,
): Promise<ManagedUser> {
  assertCanCreateRole(actor, payload.role);

  const password_hash = await hash(payload.password);
  const newUserId = randomUUID();

  const user = await usersRepository.createUser({
    ...payload,
    id: newUserId,
    password_hash,
  });

  emitUserEvent(USER_REALTIME_EVENTS.CREATE, user.id, [user.role], exclude_socket_id);
  AuditLog.record("CREATE", {
    user_id: actor.id,
    resource: "USERS",
    resource_id: newUserId,
    data: {
      username: user.username,
      display_name: user.display_name,
      role: user.role,
      is_enabled: user.is_enabled,
    },
  });

  return user;
}

async function updateUser(
  actor: ClientUser,
  payload: UpdateUserInput,
  exclude_socket_id: string | undefined,
): Promise<ManagedUser> {
  const { before, after } = await usersRepository.updateUserForTarget(
    {
      ...payload,
      password_hash: payload.password ? await hash(payload.password) : undefined,
    },
    (role) => {
      assertCanReadRole(actor, role);
      assertCanUpdateRole(actor, role);
    },
    (role) => assertCanUpdateRole(actor, role),
  );

  emitUserEvent(
    USER_REALTIME_EVENTS.UPDATE,
    after.id,
    [before.role, after.role],
    exclude_socket_id,
  );

  AuditLog.record("UPDATE", {
    user_id: actor.id,
    resource: "USERS",
    resource_id: payload.id,
    data: {
      before: {
        username: before.username,
        display_name: before.display_name,
        role: before.role,
        is_enabled: before.is_enabled,
      },
      after: {
        username: after.username,
        display_name: after.display_name,
        role: after.role,
        is_enabled: after.is_enabled,
      },
    },
  });

  return after;
}

async function updateUserStatus(
  actor: ClientUser,
  userId: string,
  isEnabled: boolean,
  exclude_socket_id: string | undefined,
): Promise<ManagedUser> {
  if (actor.id === userId && !isEnabled) {
    throw new AppError(
      400,
      "SELF_DISABLE_NOT_ALLOWED",
      "errors.users.selfDisable",
      "You cannot disable your own user.",
    );
  }

  const { before, after } = await usersRepository.updateUserStatusForTarget(
    userId,
    isEnabled,
    (role) => {
      assertCanReadRole(actor, role);
      assertCanUpdateRole(actor, role);
    },
  );

  emitUserEvent(USER_REALTIME_EVENTS.STATUS_CHANGE, after.id, [after.role], exclude_socket_id);
  AuditLog.record("UPDATE", {
    user_id: actor.id,
    resource: "USERS",
    resource_id: userId,
    data: {
      before: { is_enabled: before.is_enabled },
      after: { is_enabled: after.is_enabled },
    },
  });

  return after;
}

async function deleteUser(
  actor: ClientUser,
  userId: string,
  exclude_socket_id: string | undefined,
): Promise<void> {
  if (actor.id === userId) {
    throw new AppError(
      400,
      "SELF_DELETE_NOT_ALLOWED",
      "errors.users.selfDelete",
      "You cannot delete your own user.",
    );
  }

  const existingUser = await usersRepository.deleteUserForTarget(
    userId,
    (role) => {
      assertCanReadRole(actor, role);
      assertCanDeleteRole(actor, role);
    },
  );

  emitUserEvent(
    USER_REALTIME_EVENTS.DELETE,
    existingUser.id,
    [existingUser.role],
    exclude_socket_id,
  );

  AuditLog.record("DELETE", {
    user_id: actor.id,
    resource: "USERS",
    resource_id: userId,
  });
}

const usersService = {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  updateUserStatus,
};

export { usersService };
