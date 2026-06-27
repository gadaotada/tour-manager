import { SUPPORTED_LOCALES } from "../../libs/i18n";
import { z } from "zod";

const UI_TABLE_NAMES = {
    HOTELS: "HOTELS",
    CLIENTS: "CLIENTS",
    CONTRACTS: "CONTRACTS",
    TEMPLATES: "TEMPLATES",
    PAYMENTS: "PAYMENTS",
    LOGS: "LOGS",
    USERS: "USERS",
} as const;

const TABLE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_TABLE_PAGE_SIZE = 25;

type ValueOf<T> = T[keyof T];
type UITableName = ValueOf<typeof UI_TABLE_NAMES>;
type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number];
type UserLanguage = (typeof SUPPORTED_LOCALES)[number];

type TableSettings = {
    page_size: TablePageSize;
    hidden_columns: string[];
};

type UserSettings = {
    notifications_enabled: boolean;
    language: UserLanguage;
    table_settings: Record<UITableName, TableSettings>;
};

const tablePageSizeSchema = z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]);

const tableSettingsPatchSchema = z.object({
    page_size: tablePageSizeSchema.optional(),
    hidden_columns: z.array(z.string()).optional(),
});

const updateUserSettingsSchema = z.object({
    notifications_enabled: z.boolean().optional(),
    language: z.enum(SUPPORTED_LOCALES).optional(),
    table_settings: z
        .object({
            [UI_TABLE_NAMES.HOTELS]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.CLIENTS]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.CONTRACTS]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.TEMPLATES]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.PAYMENTS]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.LOGS]: tableSettingsPatchSchema.optional(),
            [UI_TABLE_NAMES.USERS]: tableSettingsPatchSchema.optional(),
        })
        .optional(),
});

type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;

const DEFAULT_USER_SETTINGS = {
    notifications_enabled: true,
    language: "en",
    table_settings: {
        [UI_TABLE_NAMES.HOTELS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.CLIENTS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.CONTRACTS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.TEMPLATES]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.PAYMENTS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.LOGS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
        [UI_TABLE_NAMES.USERS]: {
            page_size: DEFAULT_TABLE_PAGE_SIZE,
            hidden_columns: [],
        },
    },
} satisfies UserSettings;

function isTablePageSize(value: number): value is TablePageSize {
    return TABLE_PAGE_SIZE_OPTIONS.includes(value as TablePageSize);
}

function cloneDefaultUserSettings(): UserSettings {
    return {
        ...DEFAULT_USER_SETTINGS,
        table_settings: Object.fromEntries(
            Object.entries(DEFAULT_USER_SETTINGS.table_settings).map(([tableName, settings]) => [
                tableName,
                {
                    ...settings,
                    hidden_columns: [...settings.hidden_columns],
                },
            ]),
        ) as unknown as UserSettings["table_settings"],
    };
}

function normalizeUserSettings(settings: Partial<UserSettings> | null | undefined): UserSettings {
    const defaults = cloneDefaultUserSettings();

    if (!settings) {
        return defaults;
    }

    return {
        notifications_enabled:
            typeof settings.notifications_enabled === "boolean"
                ? settings.notifications_enabled
                : defaults.notifications_enabled,
        language:
            typeof settings.language === "string" && SUPPORTED_LOCALES.includes(settings.language)
                ? settings.language
                : defaults.language,
        table_settings: normalizeTableSettings(settings.table_settings),
    };
}

function normalizeTableSettings(
    table_settings: Partial<UserSettings>["table_settings"],
): UserSettings["table_settings"] {
    const normalized = cloneDefaultUserSettings().table_settings;

    if (!table_settings || typeof table_settings !== "object") {
        return normalized;
    }

    for (const tableName of Object.values(UI_TABLE_NAMES)) {
        const settings = table_settings[tableName];

        if (!settings) {
            continue;
        }

        normalized[tableName] = {
            page_size: isTablePageSize(settings.page_size)
                ? settings.page_size
                : normalized[tableName].page_size,
            hidden_columns: Array.isArray(settings.hidden_columns)
                ? settings.hidden_columns.filter(
                      (column): column is string => typeof column === "string",
                  )
                : normalized[tableName].hidden_columns,
        };
    }

    return normalized;
}

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
};
