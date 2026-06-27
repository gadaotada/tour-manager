import type { ReactNode } from "react";

import { SearchInput } from "@components/data";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { useT } from "@libs/i18n";

import type { ClientsListFilters } from "./clients.query";

type ClientsToolbarProps = {
    filters: ClientsListFilters;
    canCreate: boolean;
    columnVisibility?: ReactNode;
    onSearchChange: (search: string) => void;
    onReset: () => void;
    onCreate: () => void;
};

function ClientsToolbar({
    filters,
    canCreate,
    columnVisibility,
    onSearchChange,
    onReset,
    onCreate,
}: ClientsToolbarProps) {
    const t = useT();

    return (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
                    <Label htmlFor="clients-search">{t("clients.filters.search")}</Label>
                    <SearchInput
                        id="clients-search"
                        value={filters.search}
                        placeholder={t("clients.filters.searchPlaceholder")}
                        onSearchChange={onSearchChange}
                        className="lg:min-w-120"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {columnVisibility}
                <Button type="button" variant="ghost" onClick={onReset}>
                    {t("clients.filters.reset")}
                </Button>
                {canCreate ? (
                    <Button type="button" onClick={onCreate}>
                        {t("clients.actions.create")}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

export { ClientsToolbar };
