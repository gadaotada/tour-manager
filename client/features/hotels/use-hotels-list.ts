import { useCallback, useEffect, useMemo, useState } from "react";

import {
    DEFAULT_TABLE_PAGE_SIZE,
    TABLE_PAGE_SIZE_OPTIONS,
    UI_TABLE_NAMES,
    type HotelsListResult,
    type ListHotelsQuery,
} from "@tour-manager/shared";

import { useAuthUser } from "@core/stores";

import { listHotels } from "./hotels.api";

const SEARCH_DEBOUNCE_MS = 300;

const DEFAULT_HOTELS_LIST_FILTERS: HotelsListFilters = {
    search: "",
    stars: "all",
    is_active: "all",
};

type HotelsListFilters = {
    search: string;
    stars: "all" | `${number}`;
    is_active: "all" | "active" | "inactive";
};

type UseHotelsListOptions = {
    refreshKey?: number;
};

function getDefaultPageSize(userPageSize: number | undefined): number {
    if (
        userPageSize &&
        TABLE_PAGE_SIZE_OPTIONS.includes(userPageSize as (typeof TABLE_PAGE_SIZE_OPTIONS)[number])
    ) {
        return userPageSize;
    }

    return DEFAULT_TABLE_PAGE_SIZE;
}

function useHotelsList({ refreshKey = 0 }: UseHotelsListOptions = {}) {
    const user = useAuthUser();
    const defaultPageSize = getDefaultPageSize(
        user?.settings.table_settings[UI_TABLE_NAMES.HOTELS]?.page_size,
    );

    const [filters, setFilters] = useState<HotelsListFilters>(DEFAULT_HOTELS_LIST_FILTERS);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [query, setQuery] = useState<ListHotelsQuery>({
        page: 1,
        page_size: defaultPageSize,
        sort_by: "created_at",
        sort_dir: "DESC",
    });
    const [result, setResult] = useState<HotelsListResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(filters.search.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        setQuery((current) => (current.page === 1 ? current : { ...current, page: 1 }));
    }, [debouncedSearch, filters.stars, filters.is_active]);

    const listQuery = useMemo((): ListHotelsQuery => {
        const nextQuery: ListHotelsQuery = { ...query };

        nextQuery.search = debouncedSearch.length > 0 ? debouncedSearch : undefined;
        nextQuery.stars = filters.stars === "all" ? undefined : Number(filters.stars);
        nextQuery.is_active =
            filters.is_active === "all"
                ? undefined
                : filters.is_active === "active";

        return nextQuery;
    }, [debouncedSearch, filters.is_active, filters.stars, query]);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await listHotels(listQuery);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load hotels.");
        } finally {
            setLoading(false);
        }
    }, [listQuery]);

    useEffect(() => {
        refresh();
    }, [refresh, refreshKey]);

    const setPage = useCallback((page: number) => {
        setQuery((current) => ({ ...current, page }));
    }, []);

    const setPageSize = useCallback((page_size: number) => {
        setQuery((current) => ({ ...current, page: 1, page_size }));
    }, []);

    const setSort = useCallback((sort_by: ListHotelsQuery["sort_by"]) => {
        setQuery((current) => {
            if (current.sort_by === sort_by) {
                return {
                    ...current,
                    page: 1,
                    sort_dir: current.sort_dir === "ASC" ? "DESC" : "ASC",
                };
            }

            return {
                ...current,
                page: 1,
                sort_by,
                sort_dir: "DESC",
            };
        });
    }, []);

    const setSearch = useCallback((search: string) => {
        setFilters((current) => ({ ...current, search }));
    }, []);

    const setStars = useCallback((stars: HotelsListFilters["stars"]) => {
        setFilters((current) => ({ ...current, stars }));
    }, []);

    const setIsActive = useCallback((is_active: HotelsListFilters["is_active"]) => {
        setFilters((current) => ({ ...current, is_active }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_HOTELS_LIST_FILTERS);
    }, []);

    return {
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
    };
}

export {
    DEFAULT_HOTELS_LIST_FILTERS,
    useHotelsList,
    type HotelsListFilters,
};
