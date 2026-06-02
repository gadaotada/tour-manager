import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { cn } from "@libs/utils";

type DataTableColumnHeaderProps<TData, TValue> = {
    column: Column<TData, TValue>;
    title: string;
    sorted?: boolean;
    sortDesc?: boolean;
    onSort?: (columnId: string) => void;
    className?: string;
};

function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    sorted = false,
    sortDesc = false,
    onSort,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!onSort) {
        return <span className={className}>{title}</span>;
    }

    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground",
                sorted && "text-foreground",
                className,
            )}
            onClick={() => onSort(column.id)}
        >
            {title}
            {sorted ? (
                sortDesc ? (
                    <ArrowDownIcon className="size-3.5 shrink-0 opacity-70" />
                ) : (
                    <ArrowUpIcon className="size-3.5 shrink-0 opacity-70" />
                )
            ) : null}
        </button>
    );
}

export { DataTableColumnHeader };
