import type { UpdateUserSettingsInput, UserSettings } from "@tour-manager/shared";

import { useAuthActions, useAuthUser } from "@core/stores";

import { updateUserSettings } from "./settings.api";

function useUserSettings() {
    const user = useAuthUser();
    const { patchSettings } = useAuthActions();

    async function saveSettings(input: UpdateUserSettingsInput): Promise<UserSettings> {
        const settings = await updateUserSettings(input);
        patchSettings(settings);

        return settings;
    }

    return {
        saveSettings,
        settings: user?.settings ?? null,
    };
}

export { useUserSettings };
