import { CLIENT_SORT_BY_COLS, type ListClientsQuery } from "@tour-manager/shared";

import { createSortedListSearchNormalizer, normalizeStringSearchParam } from "@libs/search-params";

const clientsListSearch = createSortedListSearchNormalizer<ListClientsQuery["sort_by"]>({
    defaultSortBy: "created_at",
    defaultSortDir: "DESC",
    sortByValues: CLIENT_SORT_BY_COLS,
});

const DEFAULT_CLIENTS_LIST_FILTERS: ClientsListFilters = {
    search: "",
};

type ClientsListFilters = {
    search: string;
};

function normalizeClientsSearch(raw: Record<string, unknown>): ListClientsQuery {
    const baseQuery = clientsListSearch.normalizeBaseListSearch(raw);
    const search = normalizeStringSearchParam(raw.search);

    return {
        ...baseQuery,
        ...(search ? { search } : {}),
    };
}

function clientsQueryToFilters(query: ListClientsQuery): ClientsListFilters {
    return {
        search: query.search ?? "",
    };
}

export {
    DEFAULT_CLIENTS_LIST_FILTERS,
    clientsQueryToFilters,
    normalizeClientsSearch,
    type ClientsListFilters,
};
