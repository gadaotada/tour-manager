import { PenIcon, TrashIcon } from "lucide-react";
import { useMemo, useRef } from "react";

import {
    PERMISSIONS,
    hasPermission,
    type Client,
    type ListClientsQuery,
} from "@tour-manager/shared";

import {
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

import { deleteClient } from "./clients.api";
import { useClientsRows, useClientsSort } from "./clients.store";

type ClientsTableProps = {
    hiddenColumns?: readonly string[];
    onEdit: (client: Client) => void;
    onRefresh: () => void;
    onSort: (column: ListClientsQuery["sort_by"]) => void;
};

const CLIENT_TABLE_COLUMN_IDS = [
    "name",
    "egn",
    "address",
    "phone_number",
    "email",
    "created_at",
    "updated_at",
] as const;

type ClientTableColumnId = (typeof CLIENT_TABLE_COLUMN_IDS)[number];

const CLIENT_COLUMN_LABEL_KEYS: Record<ClientTableColumnId, MessageKey> = {
    address: "clients.columns.address",
    created_at: "clients.columns.created_at",
    egn: "clients.columns.egn",
    email: "clients.columns.email",
    name: "clients.columns.name",
    phone_number: "clients.columns.phone_number",
    updated_at: "clients.columns.updated_at",
};

const CLIENT_TABLE_VISIBILITY_COLUMNS = CLIENT_TABLE_COLUMN_IDS.map((columnId) => ({
    id: columnId,
    labelKey: CLIENT_COLUMN_LABEL_KEYS[columnId],
})) satisfies TableColumnVisibilityColumn<ClientTableColumnId>[];

const CLIENT_COLUMN_CLASS_NAMES: Partial<Record<ClientTableColumnId, string>> = {
    address: "min-w-72",
    created_at: "w-44",
    egn: "w-36",
    email: "min-w-72",
    phone_number: "w-36",
    updated_at: "w-44",
};

function isSortableClientColumn(
    columnId: ClientTableColumnId,
): columnId is ListClientsQuery["sort_by"] {
    switch (columnId) {
        case "name":
        case "created_at":
        case "updated_at":
            return true;
        default:
            return false;
    }
}

function ClientsTable({ hiddenColumns = [], onEdit, onRefresh, onSort }: ClientsTableProps) {
    const t = useT();
    const clients = useClientsRows();
    const sort = useClientsSort();
    const locale = useLocaleStore((state) => state.locale);
    const user = useAuthUser();

    const canUpdate = hasPermission(user?.permissions, PERMISSIONS.CLIENTS.UPDATE);
    const canDelete = hasPermission(user?.permissions, PERMISSIONS.CLIENTS.DELETE_ANY);

    const hasRowActions = canUpdate || canDelete;
    const tableViewportRef = useRef<HTMLDivElement | null>(null);
    const rowActions = useRowActionMenu<Client>({ enabled: hasRowActions });
    const deleteAction = useConfirmAction<Client>({
        onConfirm: (client) => deleteClient(client.id),
        onError: (error) => {
            toast.error(
                error instanceof ApiClientError ? error.message : t("clients.table.error.delete"),
            );
        },
        onSuccess: onRefresh,
    });

    const hiddenColumnSet = useMemo(() => new Set(hiddenColumns), [hiddenColumns]);
    const columns = useMemo(
        (): DataTableColumnDef<Client>[] =>
            CLIENT_TABLE_COLUMN_IDS.filter((columnId) => !hiddenColumnSet.has(columnId)).map(
                (columnId) => ({
                    id: columnId,
                    header: () =>
                        isSortableClientColumn(columnId) ? (
                            <SortableColumnHeader
                                active={sort?.sort_by === columnId}
                                dir={sort?.sort_dir ?? "ASC"}
                                label={t(CLIENT_COLUMN_LABEL_KEYS[columnId])}
                                onClick={() => onSort(columnId)}
                            />
                        ) : (
                            <span>{t(CLIENT_COLUMN_LABEL_KEYS[columnId])}</span>
                        ),
                    cell: ({ row }) => {
                        const client = row.original;

                        switch (columnId) {
                            case "name":
                                return (
                                    <span className="block min-w-0 truncate font-medium">
                                        {client.name}
                                    </span>
                                );
                            case "egn":
                                return <span className="block min-w-0 truncate">{client.egn}</span>;
                            case "address":
                                return (
                                    <span className="block min-w-0 truncate">
                                        {client.address ?? "-"}
                                    </span>
                                );
                            case "phone_number":
                                return (
                                    <span className="block min-w-0 truncate">
                                        {client.phone_number ?? "-"}
                                    </span>
                                );
                            case "email":
                                return (
                                    <span className="block min-w-0 truncate">
                                        {client.email ?? "-"}
                                    </span>
                                );
                            case "created_at":
                                return formatDateTime(client.created_at, locale);
                            case "updated_at":
                                return formatDateTime(client.updated_at, locale);
                            default:
                                return null;
                        }
                    },
                    meta: {
                        className: CLIENT_COLUMN_CLASS_NAMES[columnId],
                        cellClassName: "border-b px-4 py-3 align-middle whitespace-nowrap",
                        headerClassName:
                            "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
                    },
                }),
            ),
        [hiddenColumnSet, locale, onSort, sort?.sort_by, sort?.sort_dir, t],
    );

    return (
        <>
            <div className="overflow-hidden rounded-md border bg-card">
                <div
                    ref={tableViewportRef}
                    className="relative max-h-[65vh] min-h-64 overflow-auto"
                >
                    <DataTable
                        columns={columns}
                        data={clients}
                        getRowId={(client) => String(client.id)}
                        headerRowClassName="border-b"
                        rowClassName={() =>
                            cn(
                                "border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10",
                                hasRowActions && "cursor-pointer",
                            )
                        }
                        rowState={(client) =>
                            rowActions.selectedItem?.id === client.id ? "selected" : undefined
                        }
                        tableClassName="w-full min-w-190 caption-bottom border-separate border-spacing-0 text-sm/relaxed"
                        tableHeaderClassName="sticky top-0 z-10 bg-surface-muted text-left"
                        onRowClick={(event, client) => rowActions.openMenu(event, client)}
                    />
                </div>
            </div>

            {rowActions.menu ? (
                <ClientsRowMenu
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    client={rowActions.menu.item}
                    anchorCell={rowActions.menu.anchorCell}
                    tableViewport={tableViewportRef.current}
                    onClose={rowActions.closeMenu}
                    onDelete={(client) => {
                        rowActions.closeMenu();
                        deleteAction.request(client);
                    }}
                    onEdit={(client) => {
                        rowActions.closeMenu();
                        onEdit(client);
                    }}
                />
            ) : null}

            <ConfirmDialog
                open={deleteAction.target !== null}
                title={t("clients.delete.title")}
                description={t("clients.delete.description").replace(
                    "{name}",
                    deleteAction.target?.name ?? "",
                )}
                confirmLabel={t("clients.delete.confirm")}
                cancelLabel={t("common.actions.cancel")}
                loading={deleteAction.loading}
                onConfirm={deleteAction.confirm}
                onOpenChange={deleteAction.setOpen}
            />
        </>
    );
}

type ClientsRowMenuProps = {
    anchorCell: HTMLTableCellElement;
    canDelete: boolean;
    canUpdate: boolean;
    client: Client;
    onClose: () => void;
    onDelete: (client: Client) => void;
    onEdit: (client: Client) => void;
    tableViewport: HTMLDivElement | null;
};

function ClientsRowMenu({
    anchorCell,
    canDelete,
    canUpdate,
    client,
    onClose,
    onDelete,
    onEdit,
    tableViewport,
}: ClientsRowMenuProps) {
    const t = useT();

    return (
        <AnchoredRowMenu
            anchorCell={anchorCell}
            menuAttribute="data-clients-row-menu"
            onClose={onClose}
            tableViewport={tableViewport}
        >
            {canUpdate ? (
                <RowMenuButton onClick={() => onEdit(client)}>
                    <PenIcon className="size-4" />
                    {t("clients.actions.edit")}
                </RowMenuButton>
            ) : null}

            {canDelete ? (
                <RowMenuButton destructive onClick={() => onDelete(client)}>
                    <TrashIcon className="size-4" />
                    {t("clients.actions.delete")}
                </RowMenuButton>
            ) : null}
        </AnchoredRowMenu>
    );
}

export { CLIENT_TABLE_VISIBILITY_COLUMNS, ClientsTable };
