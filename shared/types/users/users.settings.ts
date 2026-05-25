import { SUPPORTED_LOCALES } from "../../libs/i18n";

const UI_TABLE_NAMES = {
  HOTELS: "HOTELS",
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
  pageSize: TablePageSize;
  hiddenColumns: string[];
};

type UserSettings = {
  notificationsEnabled: boolean;
  language: UserLanguage;
  tableSettings: Record<UITableName, TableSettings>;
};

const DEFAULT_USER_SETTINGS = {
  notificationsEnabled: true,
  language: "en",
  tableSettings: {
    [UI_TABLE_NAMES.HOTELS]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
    [UI_TABLE_NAMES.CONTRACTS]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
    [UI_TABLE_NAMES.TEMPLATES]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
    [UI_TABLE_NAMES.PAYMENTS]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
    [UI_TABLE_NAMES.LOGS]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
    [UI_TABLE_NAMES.USERS]: {
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      hiddenColumns: [],
    },
  },
} satisfies UserSettings;

function isTablePageSize(value: number): value is TablePageSize {
  return TABLE_PAGE_SIZE_OPTIONS.includes(value as TablePageSize);
}

function cloneDefaultUserSettings(): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    tableSettings: Object.fromEntries(
      Object.entries(DEFAULT_USER_SETTINGS.tableSettings).map(
        ([tableName, settings]) => [
          tableName,
          {
            ...settings,
            hiddenColumns: [...settings.hiddenColumns],
          },
        ],
      ),
    ) as unknown as UserSettings["tableSettings"],
  };
}

function normalizeUserSettings(
  settings: Partial<UserSettings> | null | undefined,
): UserSettings {
  const defaults = cloneDefaultUserSettings();

  if (!settings) {
    return defaults;
  }

  return {
    notificationsEnabled:
      typeof settings.notificationsEnabled === "boolean"
        ? settings.notificationsEnabled
        : defaults.notificationsEnabled,
    language:
      typeof settings.language === "string" &&
      SUPPORTED_LOCALES.includes(settings.language)
        ? settings.language
        : defaults.language,
    tableSettings: normalizeTableSettings(settings.tableSettings),
  };
}

function normalizeTableSettings(
  tableSettings: Partial<UserSettings>["tableSettings"],
): UserSettings["tableSettings"] {
  const normalized = cloneDefaultUserSettings().tableSettings;

  if (!tableSettings || typeof tableSettings !== "object") {
    return normalized;
  }

  for (const tableName of Object.values(UI_TABLE_NAMES)) {
    const settings = tableSettings[tableName];

    if (!settings) {
      continue;
    }

    normalized[tableName] = {
      pageSize: isTablePageSize(settings.pageSize)
        ? settings.pageSize
        : normalized[tableName].pageSize,
      hiddenColumns: Array.isArray(settings.hiddenColumns)
        ? settings.hiddenColumns.filter(
            (column): column is string => typeof column === "string",
          )
        : normalized[tableName].hiddenColumns,
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
  type TablePageSize,
  type TableSettings,
  type UITableName,
  type UserLanguage,
  type UserSettings,
};
