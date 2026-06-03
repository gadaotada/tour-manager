export { loginSchema, type LoginInput } from "./users.auth";

export {
    ALL_PERMISSIONS,
    PERMISSIONS,
    PERMISSION_EFFECTS,
    ROLE_PERMISSIONS,
    hasPermission,
    isPermission,
    isPermissionEffect,
    resolvePermissions,
    type Permission,
    type PermissionEffect,
    type PermissionOverride,
    type UserPermissionOverride,
} from "./users.permissions";

export { ROLES, isRole, type Role } from "./users.roles";

export { type Session } from "./users.sessions";

export {
    type CreateUserInput,
    type ListUsersQuery,
    type ManagedUser,
    type UpdateUserInput,
    type UpdateUserStatusInput,
    type UserIdParams,
    type UsersListQuery,
    type UsersListResult,
} from "./users.management";

export {
    USER_REALTIME_EVENTS,
    type UserRealtimeEvent,
    type UserRealtimePayload,
} from "./users.realtime";

export {
    DEFAULT_TABLE_PAGE_SIZE,
    DEFAULT_USER_SETTINGS,
    TABLE_PAGE_SIZE_OPTIONS,
    UI_TABLE_NAMES,
    cloneDefaultUserSettings,
    isTablePageSize,
    normalizeUserSettings,
    updateUserSettingsSchema,
    type TablePageSize,
    type TableSettings,
    type UITableName,
    type UpdateUserSettingsInput,
    type UserLanguage,
    type UserSettings,
} from "./users.settings";

export { type BaseUser, type ClientUser } from "./users.types";
