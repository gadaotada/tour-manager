import type {
  CreateUserInput,
  ListUsersQuery,
  ManagedUser,
  UpdateUserPermissionsInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserDetail,
  UserPermissionOverride,
  UsersListResult,
} from "@tour-manager/shared";

import { api } from "@libs/api";

function toListParams(query: ListUsersQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    page_size: query.page_size,
    sort_by: query.sort_by,
    sort_dir: query.sort_dir,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.role !== undefined) {
    params.role = query.role;
  }

  if (query.is_enabled !== undefined) {
    params.is_enabled = query.is_enabled ? 1 : 0;
  }

  return params;
}

async function listUsers(query: ListUsersQuery): Promise<UsersListResult> {
  return api.json.get<UsersListResult>("/api/users/list", {
    params: toListParams(query),
  });
}

async function getUserDetail(userId: string): Promise<UserDetail> {
  return api.json.get<UserDetail>(`/api/users/detail/${userId}`);
}

async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  return api.json.post<ManagedUser>("/api/users/create", input);
}

async function updateUser(input: UpdateUserInput): Promise<ManagedUser> {
  return api.json.put<ManagedUser>("/api/users/update", input);
}

async function updateUserStatus(
  userId: string,
  input: UpdateUserStatusInput,
): Promise<ManagedUser> {
  return api.json.put<ManagedUser>(`/api/users/update-status/${userId}`, input);
}

async function updateUserPermissions(
  userId: string,
  input: UpdateUserPermissionsInput,
): Promise<UserPermissionOverride[]> {
  return api.json.put<UserPermissionOverride[]>(
    `/api/users/update-permissions/${userId}`,
    input,
  );
}

async function deleteUser(userId: string): Promise<void> {
  await api.json.delete<null>(`/api/users/delete/${userId}`);
}

export {
  createUser,
  deleteUser,
  getUserDetail,
  listUsers,
  updateUserPermissions,
  updateUser,
  updateUserStatus,
};
