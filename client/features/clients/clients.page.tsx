import { useState } from "react";
import {
    useLoaderData,
    useNavigate,
    useRouter,
    useRouterState,
    useSearch,
} from "@tanstack/react-router";

import { PERMISSIONS, UI_TABLE_NAMES, hasPermission, type Client } from "@tour-manager/shared";

import { ListPageSection } from "@components/data";
import { useAuthUser } from "@core/stores";
import { TableColumnVisibilityMenu, useTableSettings } from "@features/settings";
import { useT } from "@libs/i18n";

import { ClientFormDialog } from "./client-form-dialog";
import { ClientsPagination } from "./clients-pagination";
import {
    DEFAULT_CLIENTS_LIST_FILTERS,
    clientsQueryToFilters,
    normalizeClientsSearch,
} from "./clients.query";
import { CLIENT_TABLE_VISIBILITY_COLUMNS, ClientsTable } from "./clients-table";
import { ClientsToolbar } from "./clients-toolbar";
import { useClientsRealtime } from "./use-clients-realtime";

function ClientsPage() {
    const t = useT();
    const router = useRouter();
    const navigate = useNavigate({ from: "/clients" });
    const query = useSearch({ from: "/_shell/clients" });
    const result = useLoaderData({ from: "/_shell/clients" });
    const isLoading = useRouterState({
        select: (state) => state.status === "pending",
    });
    const user = useAuthUser();
    const filters = clientsQueryToFilters(query);
    const tableSettings = useTableSettings(UI_TABLE_NAMES.CLIENTS);
    const showInitialLoading = isLoading && !result;
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const canCreate = user ? hasPermission(user.permissions, PERMISSIONS.CLIENTS.CREATE) : false;

    useClientsRealtime(() => {
        refreshClients();
    });

    function openCreateDialog() {
        setFormMode("create");
        setSelectedClient(null);
        setFormOpen(true);
    }

    function openEditDialog(client: Client) {
        setFormMode("edit");
        setSelectedClient(client);
        setFormOpen(true);
    }

    function handleMutationSuccess() {
        refreshClients();
    }

    function updateSearch(next: Partial<typeof query>) {
        navigate({
            search: (current) => normalizeClientsSearch({ ...current, ...next }),
        }).catch((error: unknown) => {
            console.error("Failed to update clients search params:", error);
        });
    }

    function setPage(page: number) {
        updateSearch({ page });
    }

    function setPageSize(page_size: number) {
        updateSearch({ page: 1, page_size });
    }

    function setSort(sort_by: typeof query.sort_by) {
        updateSearch({
            page: 1,
            sort_by,
            sort_dir: query.sort_by === sort_by && query.sort_dir === "DESC" ? "ASC" : "DESC",
        });
    }

    function setSearch(search: string) {
        updateSearch({
            page: 1,
            search: search || undefined,
        });
    }

    function resetFilters() {
        const nextQuery = normalizeClientsSearch({
            page: 1,
            page_size: query.page_size,
            sort_by: query.sort_by,
            sort_dir: query.sort_dir,
        });

        if (
            filters.search === DEFAULT_CLIENTS_LIST_FILTERS.search &&
            query.page === nextQuery.page
        ) {
            return;
        }

        navigate({
            search: () => nextQuery,
        }).catch((error: unknown) => {
            console.error("Failed to reset clients filters:", error);
        });
    }

    function refreshClients() {
        router.invalidate().catch((error: unknown) => {
            console.error("Failed to refresh clients:", error);
        });
    }

    return (
        <>
            <ListPageSection
                loading={showInitialLoading}
                loadingMessage={t("clients.list.loading")}
                empty={Boolean(result && result.data.length === 0)}
                emptyMessage={t("clients.list.empty")}
                toolbar={
                    <ClientsToolbar
                        filters={filters}
                        canCreate={canCreate}
                        columnVisibility={
                            <TableColumnVisibilityMenu
                                columns={CLIENT_TABLE_VISIBILITY_COLUMNS}
                                hiddenColumns={tableSettings.hiddenColumns}
                                saving={tableSettings.saving}
                                onHiddenColumnsChange={tableSettings.setHiddenColumns}
                            />
                        }
                        onSearchChange={setSearch}
                        onReset={resetFilters}
                        onCreate={openCreateDialog}
                    />
                }
                pagination={
                    result ? (
                        <ClientsPagination onPageChange={setPage} onPageSizeChange={setPageSize} />
                    ) : null
                }
            >
                <ClientsTable
                    hiddenColumns={tableSettings.hiddenColumns}
                    onSort={setSort}
                    onEdit={openEditDialog}
                    onRefresh={handleMutationSuccess}
                />
            </ListPageSection>

            <ClientFormDialog
                mode={formMode}
                open={formOpen}
                client={selectedClient}
                onOpenChange={setFormOpen}
                onSuccess={handleMutationSuccess}
            />
        </>
    );
}

export { ClientsPage };
