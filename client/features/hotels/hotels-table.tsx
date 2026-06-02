import { MoreHorizontalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";

import {
    HOTEL_SORT_BY_COLS,
    PERMISSIONS,
    hasPermission,
    type Hotel,
    type ListHotelsQuery,
} from "@tour-manager/shared";

import { ConfirmDialog } from "@components/data/confirm-dialog";
import { DataTable } from "@components/data/data-table";
import { DataTableColumnHeader } from "@components/data/data-table-column-header";
import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Switch } from "@components/ui/switch";
import { useAuthUser } from "@core/stores";
import { ApiClientError } from "@libs/api";
import { useLocaleStore, useT, type MessageKey } from "@libs/i18n";

import { deleteHotel, updateHotelStatus } from "./hotels.api";

type HotelsTableProps = {
    hotels: Hotel[];
    sort_by: ListHotelsQuery["sort_by"];
    sort_dir: ListHotelsQuery["sort_dir"];
    onSort: (column: ListHotelsQuery["sort_by"]) => void;
    onEdit: (hotel: Hotel) => void;
    onRefresh: () => void;
};

const SORTABLE_COLUMN_IDS = HOTEL_SORT_BY_COLS.filter((column) =>
    ["name", "address", "stars", "is_active", "created_at", "updated_at"].includes(column),
);

const HOTEL_COLUMN_LABEL_KEYS: Record<ListHotelsQuery["sort_by"], MessageKey> = {
    name: "hotels.columns.name",
    address: "hotels.columns.address",
    stars: "hotels.columns.stars",
    is_active: "hotels.columns.is_active",
    created_at: "hotels.columns.created_at",
    updated_at: "hotels.columns.updated_at",
};

function HotelsTable({
    hotels,
    sort_by,
    sort_dir,
    onSort,
    onEdit,
    onRefresh,
}: HotelsTableProps) {
    const t = useT();
    const locale = useLocaleStore((state) => state.locale);
    const user = useAuthUser();
    const canUpdate = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.UPDATE_ANY) : false;
    const canDelete = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.DELETE_ANY) : false;

    const [pendingHotelId, setPendingHotelId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Hotel | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [locale],
    );

    async function handleStatusChange(hotel: Hotel, is_active: boolean) {
        if (!canUpdate) return;

        setActionError(null);
        setPendingHotelId(hotel.id);

        try {
            await updateHotelStatus(hotel.id, {
                version: hotel.version,
                is_active,
            });
            onRefresh();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : t("hotels.table.error.status"));
            onRefresh();
        } finally {
            setPendingHotelId(null);
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        setActionError(null);

        try {
            await deleteHotel(deleteTarget.id);
            setDeleteTarget(null);
            onRefresh();
        } catch (error) {
            setActionError(
                error instanceof ApiClientError
                    ? error.message
                    : t("hotels.table.error.delete"),
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    const columns = useMemo((): ColumnDef<Hotel, unknown>[] => {
        const sortableColumns: ColumnDef<Hotel, unknown>[] = SORTABLE_COLUMN_IDS.map((columnId) => ({
            id: columnId,
            accessorKey: columnId,
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title={t(HOTEL_COLUMN_LABEL_KEYS[columnId])}
                    sorted={sort_by === columnId}
                    sortDesc={sort_dir === "DESC"}
                    onSort={(nextColumnId) =>
                        onSort(nextColumnId as ListHotelsQuery["sort_by"])
                    }
                />
            ),
            cell: ({ row }) => {
                const hotel = row.original;

                switch (columnId) {
                    case "name":
                        return (
                            <span className="block max-w-48 truncate font-medium">{hotel.name}</span>
                        );
                    case "address":
                        return <span className="block max-w-64 truncate">{hotel.address}</span>;
                    case "stars":
                        return hotel.stars;
                    case "is_active":
                        return (
                            <Switch
                                checked={hotel.is_active}
                                disabled={!canUpdate || pendingHotelId === hotel.id}
                                aria-label={t("hotels.table.toggleStatus")}
                                onCheckedChange={(checked) => handleStatusChange(hotel, checked)}
                            />
                        );
                    case "created_at":
                        return dateFormatter.format(new Date(hotel.created_at));
                    case "updated_at":
                        return dateFormatter.format(new Date(hotel.updated_at));
                    default:
                        return null;
                }
            },
        }));

        if (!canUpdate && !canDelete) {
            return sortableColumns;
        }

        return [
            ...sortableColumns,
            {
                id: "actions",
                enableSorting: false,
                header: () => (
                    <div className="text-right">{t("hotels.columns.actions")}</div>
                ),
                cell: ({ row }) => {
                    const hotel = row.original;

                    return (
                        <div className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={t("hotels.actions.openMenu")}
                                    >
                                        <MoreHorizontalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {canUpdate ? (
                                        <DropdownMenuItem onClick={() => onEdit(hotel)}>
                                            {t("hotels.actions.edit")}
                                        </DropdownMenuItem>
                                    ) : null}
                                    {canDelete ? (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => setDeleteTarget(hotel)}
                                        >
                                            {t("hotels.actions.delete")}
                                        </DropdownMenuItem>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ];
    }, [
        canDelete,
        canUpdate,
        dateFormatter,
        onEdit,
        onSort,
        pendingHotelId,
        sort_by,
        sort_dir,
        t,
    ]);

    return (
        <>
            {actionError ? (
                <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-base text-destructive">
                    {actionError}
                </p>
            ) : null}

            <DataTable columns={columns} data={hotels} manualSorting />

            <ConfirmDialog
                open={deleteTarget !== null}
                title={t("hotels.delete.title")}
                description={t("hotels.delete.description").replace(
                    "{name}",
                    deleteTarget?.name ?? "",
                )}
                confirmLabel={t("hotels.delete.confirm")}
                cancelLabel={t("common.actions.cancel")}
                loading={deleteLoading}
                onConfirm={confirmDelete}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
            />
        </>
    );
}

export { HotelsTable };
