import {
    normalizeUserSettings,
    type UpdateUserSettingsInput,
    type UserSettings,
} from "@tour-manager/shared";

import { settingsUserRepository } from "./settings.user.repository";

async function getUserSettings(userId: string): Promise<UserSettings> {
    return settingsUserRepository.getUserSettings(userId);
}

async function updateUserSettings(
    userId: string,
    input: UpdateUserSettingsInput,
): Promise<UserSettings> {
    const currentSettings = await settingsUserRepository.getUserSettings(userId);
    const nextSettings = mergeUserSettingsPatch(currentSettings, input);

    await settingsUserRepository.updateUserSettings(userId, nextSettings);

    return nextSettings;
}

async function deleteUserSettings(userId: string): Promise<UserSettings> {
    await settingsUserRepository.deleteUserSettings(userId);

    return normalizeUserSettings(null);
}

function mergeUserSettingsPatch(
    currentSettings: UserSettings,
    patch: UpdateUserSettingsInput,
): UserSettings {
    const table_settings = { ...currentSettings.table_settings };

    for (const [tableName, tablePatch] of Object.entries(patch.table_settings ?? {})) {
        if (!tablePatch) {
            continue;
        }

        const typedTableName = tableName as keyof UserSettings["table_settings"];

        table_settings[typedTableName] = {
            ...table_settings[typedTableName],
            ...tablePatch,
        };
    }

    return normalizeUserSettings({
        ...currentSettings,
        ...patch,
        table_settings,
    });
}

const settingsUserService = {
    deleteUserSettings,
    getUserSettings,
    updateUserSettings,
};

export { settingsUserService };
