import type { ReactNode } from "react";

import { Button } from "@components/ui/button";
import { SearchInput } from "@components/data";
import { Label } from "@components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { useT } from "@libs/i18n";

import { HotelStars } from "./hotel-stars";
import type { HotelsListFilters } from "./hotels.query";

type HotelsToolbarProps = {
    filters: HotelsListFilters;
    canCreate: boolean;
    columnVisibility?: ReactNode;
    onSearchChange: (search: string) => void;
    onStarsChange: (stars: HotelsListFilters["stars"]) => void;
    onIsActiveChange: (is_active: HotelsListFilters["is_active"]) => void;
    onReset: () => void;
    onCreate: () => void;
};

function HotelsToolbar({
    filters,
    canCreate,
    columnVisibility,
    onSearchChange,
    onStarsChange,
    onIsActiveChange,
    onReset,
    onCreate,
}: HotelsToolbarProps) {
    const t = useT();

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
                    <Label htmlFor="hotels-search">{t("hotels.filters.search")}</Label>
                    <SearchInput
                        id="hotels-search"
                        value={filters.search}
                        placeholder={t("hotels.filters.searchPlaceholder")}
                        onSearchChange={onSearchChange}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>{t("hotels.filters.stars")}</Label>
                    <Select value={filters.stars} onValueChange={onStarsChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("hotels.filters.all")}</SelectItem>
                            {Array.from({ length: 7 }, (_, index) => (
                                <SelectItem key={index} value={String(index)}>
                                    <span className="flex items-center gap-2">
                                        <HotelStars value={index} />
                                        <span>{t("hotels.filters.starsOption").replace("{count}", String(index))}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label>{t("hotels.filters.status")}</Label>
                    <Select value={filters.is_active} onValueChange={onIsActiveChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("hotels.filters.all")}</SelectItem>
                            <SelectItem value="active">{t("hotels.filters.active")}</SelectItem>
                            <SelectItem value="inactive">{t("hotels.filters.inactive")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {columnVisibility}
                <Button type="button" variant="ghost" onClick={onReset}>
                    {t("hotels.filters.reset")}
                </Button>
                {canCreate ? (
                    <Button type="button" onClick={onCreate}>
                        {t("hotels.actions.create")}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

export { HotelsToolbar };
