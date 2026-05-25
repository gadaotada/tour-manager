import type { ClientUser, PermissionOverride, UserSettings } from "@tour-manager/shared";
import {
  isRole,
  normalizeUserSettings,
  resolvePermissions,
} from "@tour-manager/shared";
import { AppError } from "@core/http";

import type { UserRow } from "./auth.repository";

function toClientUser(
  user: UserRow,
  permissionOverrides: readonly PermissionOverride[],
): ClientUser {
  if (!isRole(user.role)) {
    throw new AppError(
      500,
      "INVALID_USER_ROLE",
      "errors.internal",
      "Unexpected server error.",
    );
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    isEnabled: Boolean(user.is_enabled),
    role: user.role,
    permissions: resolvePermissions(user.role, permissionOverrides),
    settings: parseUserSettings(user.settings),
  };
}

function parseUserSettings(settings: UserRow["settings"]): UserSettings {
  if (!settings) {
    return normalizeUserSettings(null);
  }

  try {
    return normalizeUserSettings(JSON.parse(settings) as Partial<UserSettings>);
  } catch {
    return normalizeUserSettings(null);
  }
}

export { toClientUser };
