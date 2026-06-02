import { Columns3Icon, Loader2Icon } from "lucide-react";

import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ApiClientError } from "@libs/api";
import { useT, type MessageKey } from "@libs/i18n";
import { toast } from "@libs/toasts";
import { cn } from "@libs/utils";

type TableColumnVisibilityColumn<TColumnId extends string> = {
    id: TColumnId;
    labelKey: MessageKey;
};

type TableColumnVisibilityMenuProps<TColumnId extends string> = {
    columns: readonly TableColumnVisibilityColumn<TColumnId>[];
    hiddenColumns: readonly string[];
    saving: boolean;
    onHiddenColumnsChange: (hiddenColumns: string[]) => Promise<void>;
};

function TableColumnVisibilityMenu<TColumnId extends string>({
    columns,
    hiddenColumns,
    saving,
    onHiddenColumnsChange,
}: TableColumnVisibilityMenuProps<TColumnId>) {
    const t = useT();
    const columnIdSet = new Set(columns.map((column) => column.id));
    const hiddenColumnSet = new Set(
        hiddenColumns.filter((hiddenColumn): hiddenColumn is TColumnId =>
            columnIdSet.has(hiddenColumn as TColumnId),
        ),
    );
    const effectiveHiddenColumns = Array.from(hiddenColumnSet);
    const visibleColumnCount = columns.filter((column) => !hiddenColumnSet.has(column.id)).length;

    async function toggleColumn(columnId: TColumnId, visible: boolean) {
        const nextHiddenColumns = visible
            ? effectiveHiddenColumns.filter((hiddenColumn) => hiddenColumn !== columnId)
            : [...effectiveHiddenColumns, columnId];

        try {
            await onHiddenColumnsChange(nextHiddenColumns);
        } catch (error) {
            toast.error(
                error instanceof ApiClientError
                    ? error.message
                    : t("settings.tableColumns.error.save"),
            );
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" disabled={saving}>
                    {saving ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <Columns3Icon className="size-4" />
                    )}
                    <span>{t("dashboard.workspace.customizeColumns")}</span>
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium leading-none text-primary-foreground tabular-nums">
                        {hiddenColumnSet.size}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("dashboard.workspace.customizeColumns")}</DropdownMenuLabel>
                {columns.map((column) => {
                    const checked = !hiddenColumnSet.has(column.id);
                    const isLastVisibleColumn = checked && visibleColumnCount <= 1;

                    return (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            checked={checked}
                            disabled={saving || isLastVisibleColumn}
                            onCheckedChange={(nextChecked) => {
                                toggleColumn(column.id, nextChecked === true);
                            }}
                        >
                            <span
                                className={cn(
                                    "min-w-0 truncate",
                                    isLastVisibleColumn && "text-muted-foreground",
                                )}
                            >
                                {t(column.labelKey)}
                            </span>
                        </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { TableColumnVisibilityMenu, type TableColumnVisibilityColumn };
