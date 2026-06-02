import { DB_ERROR_CODES, DB_ERROR_MESSAGE_KEYS, DbError, query } from "@libs/db";
import { normalizeUserSettings, type UserSettings } from "@tour-manager/shared";

type UserSettingsRow = {
    settings: string | null;
};

async function updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
    return query(async (qe) => {
        const mutation = await qe.mutate(
            "execute",
            `
            UPDATE users
            SET settings = ?
            WHERE id = ?
            `,
            [JSON.stringify(settings), userId],
        );

        if (!mutation.ok) throw new DbError(mutation.error);

        if (mutation.result.affectedRows === 0) {
            throwUserSettingsNotFound();
        }
    });
}

async function getUserSettings(userId: string): Promise<UserSettings> {
    return query(async (qe) => {
        const rows = await qe.read<UserSettingsRow>(
            "execute",
            `
            SELECT settings
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [userId],
        );
        const row = rows[0];

        if (!row) {
            throwUserSettingsNotFound();
        }

        return parseUserSettings(row.settings);
    });
}

async function deleteUserSettings(userId: string): Promise<void> {
    return query(async (qe) => {
        const mutation = await qe.mutate(
            "execute",
            `
            UPDATE users
            SET settings = NULL
            WHERE id = ?
            `,
            [userId],
        );

        if (!mutation.ok) throw new DbError(mutation.error);

        if (mutation.result.affectedRows === 0) {
            throwUserSettingsNotFound();
        }
    });
}

function parseUserSettings(settings: string | null): UserSettings {
    if (!settings) {
        return normalizeUserSettings(null);
    }

    try {
        return normalizeUserSettings(JSON.parse(settings) as Partial<UserSettings>);
    } catch {
        return normalizeUserSettings(null);
    }
}

function throwUserSettingsNotFound(): never {
    throw new DbError({
        statusCode: 404,
        code: DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN,
        messageKey: DB_ERROR_MESSAGE_KEYS.NOT_FOUND_OR_FORBIDDEN,
        safeMessage: "User settings were not found.",
        cause: null,
    });
}

const settingsUserRepository = {
    updateUserSettings,
    getUserSettings,
    deleteUserSettings,
};

export { settingsUserRepository };
