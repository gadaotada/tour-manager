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

  const user = await usersRepository.createUser({
    ...payload,
    id: randomUUID(),
    password_hash,
  });

  emitUserEvent(USER_REALTIME_EVENTS.CREATE, user.id, [user.role], exclude_socket_id);

  return user;
}

async function updateUser(
  actor: ClientUser,
  payload: UpdateUserInput,
  exclude_socket_id: string | undefined,
): Promise<ManagedUser> {
  const existingUser = await getTargetUser(actor, payload.id);

  assertCanUpdateRole(actor, existingUser.role);
  assertCanUpdateRole(actor, payload.role);

  const user = await usersRepository.updateUser({
    ...payload,
    password_hash: payload.password ? await hash(payload.password) : undefined,
  });

  emitUserEvent(
    USER_REALTIME_EVENTS.UPDATE,
    user.id,
    [existingUser.role, user.role],
    exclude_socket_id,
  );

  return user;
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

  const existingUser = await getTargetUser(actor, userId);
  assertCanUpdateRole(actor, existingUser.role);

  const user = await usersRepository.updateUserStatus(userId, isEnabled);

  emitUserEvent(USER_REALTIME_EVENTS.STATUS_CHANGE, user.id, [user.role], exclude_socket_id);

  return user;
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

  const existingUser = await getTargetUser(actor, userId);
  assertCanDeleteRole(actor, existingUser.role);

  await usersRepository.deleteUser(userId);
  emitUserEvent(
    USER_REALTIME_EVENTS.DELETE,
    existingUser.id,
    [existingUser.role],
    exclude_socket_id,
  );
}

async function getTargetUser(actor: ClientUser, userId: string): Promise<ManagedUser> {
  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "errors.db.notFound",
      "Record was not found.",
    );
  }

  assertCanReadRole(actor, user.role);

  return user;
}

const usersService = {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  updateUserStatus,
};

export { usersService };
