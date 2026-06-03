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
  type Role,
  type UpdateUserInput,
  type UserRealtimePayload,
  type UsersListResult,
} from "@tour-manager/shared";

import { wsGateway } from "@core/realtime";
import { AppError, forbiddenError } from "@core/http";
import { usersRepository } from "./users.repository";

function emitUserEvent(
  event: UserRealtimePayload["event"],
  userId: string,
  visibleRoles: readonly Role[],
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
    filter: (viewer) => visibleRoles.some((role) => canViewUserRole(viewer, role)),
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

  return {
    data: rows,
    total,
    page: query.page,
    page_size: query.page_size,
    last_page: Math.max(1, Math.ceil(total / query.page_size)),
    query: {
      search: sanitizedQuery.search,
      role: sanitizedQuery.role,
      is_enabled: sanitizedQuery.is_enabled,
      sort_by: sanitizedQuery.sort_by,
      sort_dir: sanitizedQuery.sort_dir,
    },
  };
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

  if (user.role === ROLES.ADMIN && !hasPermission(actor.permissions, PERMISSIONS.USERS.READ_ANY)) {
    throw forbiddenError();
  }

  return user;
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

function canViewUserRole(viewer: ClientUser, role: Role): boolean {
  if (hasPermission(viewer.permissions, PERMISSIONS.USERS.READ_ANY)) {
    return true;
  }

  return isNonAdminRole(role) && hasPermission(
    viewer.permissions,
    PERMISSIONS.USERS.READ_NON_ADMIN,
  );
}

function isNonAdminRole(role: Role): boolean {
  return role !== ROLES.ADMIN;
}

const usersService = {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  updateUserStatus,
};

export { usersService };
