import { useState } from "react";
import type { TablePageSize, UITableName } from "@tour-manager/shared";

import { useUserSettings } from "./use-user-settings";

function useTableSettings(tableName: UITableName) {
    const { saveSettings, settings } = useUserSettings();
    const [saving, setSaving] = useState(false);
    const tableSettings = settings?.table_settings[tableName] ?? null;
    const hiddenColumns = tableSettings?.hidden_columns ?? [];
    const pageSize = tableSettings?.page_size ?? 25;

    async function setHiddenColumns(hidden_columns: string[]) {
        setSaving(true);

        try {
            await saveSettings({
                table_settings: {
                    [tableName]: {
                        hidden_columns,
                    },
                },
            });
        } finally {
            setSaving(false);
        }
    }

    async function setPageSize(page_size: TablePageSize) {
        setSaving(true);

        try {
            await saveSettings({
                table_settings: {
                    [tableName]: {
                        page_size,
                    },
                },
            });
        } finally {
            setSaving(false);
        }
    }

    return {
        hiddenColumns,
        pageSize,
        saving,
        setHiddenColumns,
        setPageSize,
        tableSettings,
    };
}

export { useTableSettings };
