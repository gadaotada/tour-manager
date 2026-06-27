import { PenIcon, PowerIcon, TrashIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
    HOTEL_SORT_BY_COLS,
    PERMISSIONS,
    hasPermission,
    type Hotel,
    type ListHotelsQuery,
} from "@tour-manager/shared";

import {
    ActiveStateBadge,
    AnchoredRowMenu,
    ConfirmDialog,
    DataTable,
    RowMenuButton,
    SortableColumnHeader,
    useConfirmAction,
    useRowActionMenu,
    type DataTableColumnDef,
} from "@components/data";
import { useAuthUser } from "@core/stores";
import type { TableColumnVisibilityColumn } from "@features/settings";
import { ApiClientError } from "@libs/api";
import { useLocaleStore, useT, type MessageKey } from "@libs/i18n";
import { toast } from "@libs/toasts";
import { cn, formatDateTime } from "@libs/utils";

import { HotelStars } from "./hotel-stars";
import { deleteHotel, updateHotelStatus } from "./hotels.api";
import { useHotelsRows, useHotelsSort } from "./hotels.store";

type HotelsTableProps = {
    hiddenColumns?: readonly string[];
    onEdit: (hotel: Hotel) => void;
    onRefresh: () => void;
    onSort: (column: ListHotelsQuery["sort_by"]) => void;
};

const HOTEL_COLUMN_LABEL_KEYS: Record<ListHotelsQuery["sort_by"], MessageKey> = {
    address: "hotels.columns.address",
    created_at: "hotels.columns.created_at",
    is_active: "hotels.columns.is_active",
    name: "hotels.columns.name",
    stars: "hotels.columns.stars",
    updated_at: "hotels.columns.updated_at",
};

const HOTEL_TABLE_COLUMN_IDS = HOTEL_SORT_BY_COLS.filter((column) =>
    ["name", "address", "stars", "is_active", "created_at", "updated_at"].includes(column),
);

const HOTEL_TABLE_VISIBILITY_COLUMNS = HOTEL_TABLE_COLUMN_IDS.map((columnId) => ({
    id: columnId,
    labelKey: HOTEL_COLUMN_LABEL_KEYS[columnId],
})) satisfies TableColumnVisibilityColumn<ListHotelsQuery["sort_by"]>[];

const HOTEL_COLUMN_CLASS_NAMES: Partial<Record<ListHotelsQuery["sort_by"], string>> = {
    address: "min-w-96",
    created_at: "w-44",
    is_active: "w-28",
    stars: "w-20",
    updated_at: "w-44",
};

function HotelsTable({ hiddenColumns = [], onEdit, onRefresh, onSort }: HotelsTableProps) {
    const t = useT();
    const hotels = useHotelsRows();
    const sort = useHotelsSort();
    const locale = useLocaleStore((state) => state.locale);
    const user = useAuthUser();

    const canUpdate = hasPermission(user?.permissions, PERMISSIONS.HOTELS.UPDATE_ANY);
    const canDelete = hasPermission(user?.permissions, PERMISSIONS.HOTELS.DELETE_ANY);

    const hasRowActions = canUpdate || canDelete;
    const tableViewportRef = useRef<HTMLDivElement | null>(null);
    const rowActions = useRowActionMenu<Hotel>({ enabled: hasRowActions });
    const deleteAction = useConfirmAction<Hotel>({
        onConfirm: (hotel) => deleteHotel(hotel.id),
        onError: (error) => {
            toast.error(
                error instanceof ApiClientError ? error.message : t("hotels.table.error.delete"),
            );
        },
        onSuccess: onRefresh,
    });

    const [pendingHotelId, setPendingHotelId] = useState<number | null>(null);
    const hiddenColumnSet = useMemo(() => new Set(hiddenColumns), [hiddenColumns]);
    const columns = useMemo(
        (): DataTableColumnDef<Hotel>[] =>
            HOTEL_TABLE_COLUMN_IDS.filter((columnId) => !hiddenColumnSet.has(columnId)).map(
                (columnId) => ({
                    id: columnId,
                    header: () => (
                        <SortableColumnHeader
                            active={sort?.sort_by === columnId}
                            dir={sort?.sort_dir ?? "ASC"}
                            label={t(HOTEL_COLUMN_LABEL_KEYS[columnId])}
                            onClick={() => onSort(columnId)}
                        />
                    ),
                    cell: ({ row }) => {
                        const hotel = row.original;

                        switch (columnId) {
                            case "name":
                                return (
                                    <span className="block min-w-0 truncate font-medium">
                                        {hotel.name}
                                    </span>
                                );
                            case "address":
                                return (
                                    <span className="block min-w-0 truncate">{hotel.address}</span>
                                );
                            case "stars":
                                return <HotelStars value={hotel.stars} />;
                            case "is_active":
                                return (
                                    <ActiveStateBadge
                                        activeLabel={t("hotels.filters.active")}
                                        inactiveLabel={t("hotels.filters.inactive")}
                                        isActive={hotel.is_active}
                                    />
                                );
                            case "created_at":
                                return formatDateTime(hotel.created_at, locale);
                            case "updated_at":
                                return formatDateTime(hotel.updated_at, locale);
                            default:
                                return null;
                        }
                    },
                    meta: {
                        className: HOTEL_COLUMN_CLASS_NAMES[columnId],
                        cellClassName: "border-b px-4 py-3 align-middle whitespace-nowrap",
                        headerClassName:
                            "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
                    },
                }),
            ),
        [hiddenColumnSet, locale, onSort, sort?.sort_by, sort?.sort_dir, t],
    );

    async function handleStatusChange(hotel: Hotel) {
        if (!canUpdate) return;

        rowActions.closeMenu();
        setPendingHotelId(hotel.id);

        try {
            await updateHotelStatus(hotel.id, {
                version: hotel.version,
                is_active: !hotel.is_active,
            });
            onRefresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("hotels.table.error.status"));
            onRefresh();
        } finally {
            setPendingHotelId(null);
        }
    }

    return (
        <>
            <div className="overflow-hidden rounded-md border bg-card">
                <div
                    ref={tableViewportRef}
                    className="relative max-h-[65vh] min-h-64 overflow-auto"
                >
                    <DataTable
                        columns={columns}
                        data={hotels}
                        getRowId={(hotel) => String(hotel.id)}
                        headerRowClassName="border-b"
                        rowClassName={() =>
                            cn(
                                "border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10",
                                hasRowActions && "cursor-pointer",
                            )
                        }
                        rowState={(hotel) =>
                            rowActions.selectedItem?.id === hotel.id ? "selected" : undefined
                        }
                        tableClassName="w-full min-w-190 caption-bottom border-separate border-spacing-0 text-sm/relaxed"
                        tableHeaderClassName="sticky top-0 z-10 bg-surface-muted text-left"
                        onRowClick={(event, hotel) => rowActions.openMenu(event, hotel)}
                    />
                </div>
            </div>

            {rowActions.menu ? (
                <HotelsRowMenu
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    hotel={rowActions.menu.item}
                    anchorCell={rowActions.menu.anchorCell}
                    isStatusPending={pendingHotelId === rowActions.menu.item.id}
                    tableViewport={tableViewportRef.current}
                    onClose={rowActions.closeMenu}
                    onDelete={(hotel) => {
                        rowActions.closeMenu();
                        deleteAction.request(hotel);
                    }}
                    onEdit={(hotel) => {
                        rowActions.closeMenu();
                        onEdit(hotel);
                    }}
                    onToggleStatus={handleStatusChange}
                />
            ) : null}

            <ConfirmDialog
                open={deleteAction.target !== null}
                title={t("hotels.delete.title")}
                description={t("hotels.delete.description").replace(
                    "{name}",
                    deleteAction.target?.name ?? "",
                )}
                confirmLabel={t("hotels.delete.confirm")}
                cancelLabel={t("common.actions.cancel")}
                loading={deleteAction.loading}
                onConfirm={deleteAction.confirm}
                onOpenChange={deleteAction.setOpen}
            />
        </>
    );
}

type HotelsRowMenuProps = {
    anchorCell: HTMLTableCellElement;
    canDelete: boolean;
    canUpdate: boolean;
    hotel: Hotel;
    isStatusPending: boolean;
    onClose: () => void;
    onDelete: (hotel: Hotel) => void;
    onEdit: (hotel: Hotel) => void;
    onToggleStatus: (hotel: Hotel) => void;
    tableViewport: HTMLDivElement | null;
};

function HotelsRowMenu({
    anchorCell,
    canDelete,
    canUpdate,
    hotel,
    isStatusPending,
    onClose,
    onDelete,
    onEdit,
    onToggleStatus,
    tableViewport,
}: HotelsRowMenuProps) {
    const t = useT();

    return (
        <AnchoredRowMenu
            anchorCell={anchorCell}
            menuAttribute="data-hotels-row-menu"
            onClose={onClose}
            tableViewport={tableViewport}
        >
            {canUpdate ? (
                <>
                    <RowMenuButton onClick={() => onEdit(hotel)}>
                        <PenIcon className="size-4" />
                        {t("hotels.actions.edit")}
                    </RowMenuButton>
                    <RowMenuButton disabled={isStatusPending} onClick={() => onToggleStatus(hotel)}>
                        <PowerIcon className="size-4" />
                        {t("hotels.actions.toggleStatus")}
                    </RowMenuButton>
                </>
            ) : null}

            {canDelete ? (
                <RowMenuButton destructive onClick={() => onDelete(hotel)}>
                    <TrashIcon className="size-4" />
                    {t("hotels.actions.delete")}
                </RowMenuButton>
            ) : null}
        </AnchoredRowMenu>
    );
}

export { HOTEL_TABLE_VISIBILITY_COLUMNS, HotelsTable };
