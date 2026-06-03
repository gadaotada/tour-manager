import { z } from "zod";

import { schemaBoolean, schemaInvalidType, schemaMessage } from "../../libs/validation";
import { createTranslatedSortedListQuerySchema } from "../common";
import {
  PERMISSION_EFFECTS,
  isPermission,
} from "../../types/users/users.permissions";
import { ROLES } from "../../types/users/users.roles";

export const USER_SORT_BY_COLS = [
  "username",
  "display_name",
  "role",
  "is_enabled",
  "created_at",
  "updated_at",
] as const;

const userIdSchema = z.string().uuid(schemaMessage("users.validation.id.uuid"));

const userSearchQuerySchema = z
  .string()
  .trim()
  .max(255, schemaMessage("users.validation.search.max"))
  .optional()
  .transform((value) => (value === undefined || value.length === 0 ? undefined : value));

const userPasswordSchema = z
  .string()
  .min(8, schemaMessage("users.validation.password.min"))
  .max(160, schemaMessage("users.validation.password.max"));

const userCoreSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, schemaMessage("users.validation.username.min"))
    .max(120, schemaMessage("users.validation.username.max")),
  display_name: z
    .string()
    .trim()
    .min(2, schemaMessage("users.validation.display_name.min"))
    .max(160, schemaMessage("users.validation.display_name.max")),
  role: z.enum([ROLES.ADMIN, ROLES.MODERATOR, ROLES.EMPLOYEE], schemaMessage("users.validation.role.invalid")),
  is_enabled: z.boolean(schemaBoolean("users.validation.is_enabled.invalid")),
});

export const createUserSchema = userCoreSchema.extend({
  password: userPasswordSchema,
});

export const updateUserSchema = userCoreSchema.extend({
  id: userIdSchema,
  password: userPasswordSchema.optional().or(z.literal("")).transform((value) => value || undefined),
});

export const updateUserStatusSchema = z.object({
  is_enabled: z.boolean(schemaBoolean("users.validation.is_enabled.invalid")),
});

export const updateUserPermissionsSchema = z.object({
  permission_overrides: z.array(
    z.object({
      permission: z
        .string()
        .refine(isPermission, schemaMessage("users.validation.permissions.permission.invalid")),
      effect: z
        .enum([PERMISSION_EFFECTS.ALLOW, PERMISSION_EFFECTS.DENY], schemaMessage("users.validation.permissions.effect.invalid")),
    }),
  ),
});

export const userIdParamsSchema = z.object({
  id: userIdSchema,
});

export const listUsersQuerySchema = createTranslatedSortedListQuerySchema(USER_SORT_BY_COLS, {
  messagePrefix: "users.validation.list",
  defaults: { sort_by: "created_at", sort_dir: "DESC" },
}).extend({
  search: userSearchQuerySchema,
  role: z.enum([ROLES.ADMIN, ROLES.MODERATOR, ROLES.EMPLOYEE]).optional(),
  is_enabled: z.coerce
    .number(schemaInvalidType("users.validation.filter.is_enabled.int"))
    .int(schemaMessage("users.validation.filter.is_enabled.int"))
    .min(0, schemaMessage("users.validation.filter.is_enabled.min"))
    .max(1, schemaMessage("users.validation.filter.is_enabled.max"))
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 1)),
});
