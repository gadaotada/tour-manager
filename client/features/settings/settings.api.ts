import type { UpdateUserSettingsInput, UserSettings } from "@tour-manager/shared";

import { api } from "@libs/api";

async function getUserSettings(): Promise<UserSettings> {
    return api.json.get<UserSettings>("/api/settings/user/list");
}

async function updateUserSettings(input: UpdateUserSettingsInput): Promise<UserSettings> {
    return api.json.put<UserSettings>("/api/settings/user/update", input);
}

async function resetUserSettings(): Promise<UserSettings> {
    return api.json.delete<UserSettings>("/api/settings/user/delete");
}

export { getUserSettings, resetUserSettings, updateUserSettings };
