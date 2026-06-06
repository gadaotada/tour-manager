import { normalizeUserSettings, type UpdateUserSettingsInput, type UserSettings } from "@tour-manager/shared";

import { settingsUserRepository } from "./settings.user.repository";

async function getUserSettings(userId: string): Promise<UserSettings> {
    return settingsUserRepository.getUserSettings(userId);
}

async function updateUserSettings(
    userId: string,
    input: UpdateUserSettingsInput,
): Promise<UserSettings> {
    return settingsUserRepository.patchUserSettings(userId, input);
}

async function deleteUserSettings(userId: string): Promise<UserSettings> {
    await settingsUserRepository.deleteUserSettings(userId);

    return normalizeUserSettings(null);
}

const settingsUserService = {
    deleteUserSettings,
    getUserSettings,
    updateUserSettings,
};

export { settingsUserService };
