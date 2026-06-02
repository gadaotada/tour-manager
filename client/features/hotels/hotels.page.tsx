import { useState } from "react";
import { useLoaderData, useNavigate, useRouter, useRouterState, useSearch } from "@tanstack/react-router";

import { PERMISSIONS, UI_TABLE_NAMES, hasPermission, type Hotel } from "@tour-manager/shared";

import { ListPageSection } from "@components/data";
import { useAuthUser } from "@core/stores";
import { TableColumnVisibilityMenu, useTableSettings } from "@features/settings";
import { useT } from "@libs/i18n";

import { HotelFormDialog } from "./hotel-form-dialog";
import { HotelsPagination } from "./hotels-pagination";
import { hotelsQueryToFilters, normalizeHotelsSearch, type HotelsListFilters } from "./hotels.query";
import { HOTEL_TABLE_VISIBILITY_COLUMNS, HotelsTable } from "./hotels-table";
import { HotelsToolbar } from "./hotels-toolbar";
import { useHotelsRealtime } from "./use-hotels-realtime";

function HotelsPage() {
    const t = useT();
    const router = useRouter();
    const navigate = useNavigate({ from: "/hotels" });
    const query = useSearch({ from: "/_shell/hotels" });
    const result = useLoaderData({ from: "/_shell/hotels" });
    const isLoading = useRouterState({
        select: (state) => state.status === "pending",
    });
    const user = useAuthUser();
    const filters = hotelsQueryToFilters(query);
    const tableSettings = useTableSettings(UI_TABLE_NAMES.HOTELS);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    const canCreate = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.CREATE_ANY) : false;

    useHotelsRealtime(() => {
        router.invalidate();
    });

    function openCreateDialog() {
        setFormMode("create");
        setSelectedHotel(null);
        setFormOpen(true);
    }

    function openEditDialog(hotel: Hotel) {
        setFormMode("edit");
        setSelectedHotel(hotel);
        setFormOpen(true);
    }

    function handleMutationSuccess() {
        router.invalidate();
    }

    function updateSearch(next: Partial<typeof query>) {
        navigate({
            search: (current) => normalizeHotelsSearch({ ...current, ...next }),
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

    function setStars(stars: HotelsListFilters["stars"]) {
        updateSearch({
            page: 1,
            stars: stars === "all" ? undefined : Number(stars),
        });
    }

    function setIsActive(is_active: HotelsListFilters["is_active"]) {
        updateSearch({
            page: 1,
            is_active:
                is_active === "all"
                    ? undefined
                    : is_active === "active",
        });
    }

    function resetFilters() {
        navigate({
            search: () =>
                normalizeHotelsSearch({
                    page: 1,
                    page_size: query.page_size,
                    sort_by: query.sort_by,
                    sort_dir: query.sort_dir,
                }),
        });
    }

    return (
        <>
            <ListPageSection
                loading={isLoading}
                loadingMessage={t("hotels.list.loading")}
                empty={Boolean(result && result.data.length === 0)}
                emptyMessage={t("hotels.list.empty")}
                toolbar={
                    <HotelsToolbar
                        filters={filters}
                        canCreate={canCreate}
                        columnVisibility={
                            <TableColumnVisibilityMenu
                                columns={HOTEL_TABLE_VISIBILITY_COLUMNS}
                                hiddenColumns={tableSettings.hiddenColumns}
                                saving={tableSettings.saving}
                                onHiddenColumnsChange={tableSettings.setHiddenColumns}
                            />
                        }
                        onSearchChange={setSearch}
                        onStarsChange={setStars}
                        onIsActiveChange={setIsActive}
                        onReset={resetFilters}
                        onCreate={openCreateDialog}
                    />
                }
                pagination={
                    result ? (
                        <HotelsPagination
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    ) : null
                }
            >
                <HotelsTable
                    hiddenColumns={tableSettings.hiddenColumns}
                    onSort={setSort}
                    onEdit={openEditDialog}
                    onRefresh={handleMutationSuccess}
                />
            </ListPageSection>

            <HotelFormDialog
                mode={formMode}
                open={formOpen}
                hotel={selectedHotel}
                onOpenChange={setFormOpen}
                onSuccess={handleMutationSuccess}
            />
        </>
    );
}

export { HotelsPage };
