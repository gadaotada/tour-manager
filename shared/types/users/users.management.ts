import type { z } from "zod";

import type {
  createUserSchema,
  listUsersQuerySchema,
  updateUserPermissionsSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from "../../schemas/users";
import type { PaginatedResult } from "../pagination";
import type { UserPermissionOverride } from "./users.permissions";
import type { Role } from "./users.roles";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;
type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
type UpdateUserPermissionsInput = z.infer<typeof updateUserPermissionsSchema>;
type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
type UserIdParams = z.infer<typeof userIdParamsSchema>;

type ManagedUser = {
  id: string;
  username: string;
  display_name: string;
  role: Role;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type UsersListQuery = Pick<ListUsersQuery, "search" | "role" | "is_enabled" | "sort_by" | "sort_dir">;

type UsersListResult = PaginatedResult<ManagedUser[], UsersListQuery>;

type UserDetail = ManagedUser & {
  permission_overrides: UserPermissionOverride[];
};

export type {
  CreateUserInput,
  ListUsersQuery,
  UserDetail,
  ManagedUser,
  UpdateUserPermissionsInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserIdParams,
  UsersListQuery,
  UsersListResult,
};
