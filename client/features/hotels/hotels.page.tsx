import { useCallback, useState } from "react";

import { PERMISSIONS, TABLE_PAGE_SIZE_OPTIONS, hasPermission, type Hotel } from "@tour-manager/shared";

import { PaginationControls } from "@components/data/pagination-controls";
import { useAuthUser } from "@core/stores";
import { useT } from "@libs/i18n";

import { HotelFormDialog } from "./hotel-form-dialog";
import { HotelsTable } from "./hotels-table";
import { HotelsToolbar } from "./hotels-toolbar";
import { useHotelsList } from "./use-hotels-list";
import { useHotelsRealtime } from "./use-hotels-realtime";

function HotelsPage() {
    const t = useT();
    const user = useAuthUser();
    const [refreshKey, setRefreshKey] = useState(0);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formOpen, setFormOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    const canCreate = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.CREATE_ANY) : false;

    const bumpRefresh = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    const {
        error,
        filters,
        loading,
        refresh,
        resetFilters,
        result,
        setIsActive,
        setPage,
        setPageSize,
        setSearch,
        setSort,
        setStars,
    } = useHotelsList({ refreshKey });

    useHotelsRealtime(bumpRefresh);

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
        bumpRefresh();
        refresh();
    }

    return (
        <section className="space-y-6 rounded-lg border bg-card p-4 shadow-sm lg:p-6">
            <div>
                <h2 className="text-lg font-semibold tracking-normal lg:text-xl">
                    {t("pages.hotels.title")}
                </h2>
                <p className="mt-1 text-base text-muted-foreground">{t("hotels.list.description")}</p>
            </div>

            <HotelsToolbar
                filters={filters}
                canCreate={canCreate}
                onSearchChange={setSearch}
                onStarsChange={setStars}
                onIsActiveChange={setIsActive}
                onReset={resetFilters}
                onCreate={openCreateDialog}
            />

            {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-base text-destructive">
                    {error}
                </p>
            ) : null}

            {loading && !result ? (
                <p className="text-base text-muted-foreground">{t("hotels.list.loading")}</p>
            ) : null}

            {!loading && result && result.data.length === 0 ? (
                <p className="rounded-md border border-dashed px-4 py-8 text-center text-base text-muted-foreground">
                    {t("hotels.list.empty")}
                </p>
            ) : null}

            {result && result.data.length > 0 ? (
                <>
                    <HotelsTable
                        hotels={result.data}
                        sort_by={result.query.sort_by}
                        sort_dir={result.query.sort_dir}
                        onSort={setSort}
                        onEdit={openEditDialog}
                        onRefresh={handleMutationSuccess}
                    />

                    <PaginationControls
                        page={result.page}
                        page_size={result.page_size}
                        last_page={result.last_page}
                        total={result.total}
                        pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </>
            ) : null}

            <HotelFormDialog
                mode={formMode}
                open={formOpen}
                hotel={selectedHotel}
                onOpenChange={setFormOpen}
                onSuccess={handleMutationSuccess}
            />
        </section>
    );
}

export { HotelsPage };
