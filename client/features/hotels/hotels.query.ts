import {
  HOTEL_SORT_BY_COLS,
  type ListHotelsQuery,
} from "@tour-manager/shared";

import {
  createSortedListSearchNormalizer,
  normalizeBooleanSearchParam,
  normalizeIntegerSearchParam,
  normalizeStringSearchParam,
} from "@libs/search-params";

const hotelsListSearch = createSortedListSearchNormalizer<ListHotelsQuery["sort_by"]>({
  defaultSortBy: "created_at",
  defaultSortDir: "DESC",
  sortByValues: HOTEL_SORT_BY_COLS,
});

const DEFAULT_HOTELS_LIST_FILTERS: HotelsListFilters = {
  is_active: "all",
  search: "",
  stars: "all",
};

type HotelsListFilters = {
  is_active: "all" | "active" | "inactive";
  search: string;
  stars: "all" | `${number}`;
};

function normalizeHotelsSearch(raw: Record<string, unknown>): ListHotelsQuery {
  const baseQuery = hotelsListSearch.normalizeBaseListSearch(raw);
  const search = normalizeStringSearchParam(raw.search);
  const stars = normalizeIntegerSearchParam(raw.stars, { max: 6, min: 0 });
  const is_active = normalizeBooleanSearchParam(raw.is_active);

  return {
    ...baseQuery,
    ...(search ? { search } : {}),
    ...(stars !== undefined ? { stars } : {}),
    ...(is_active !== undefined ? { is_active } : {}),
  };
}

function hotelsQueryToFilters(query: ListHotelsQuery): HotelsListFilters {
  return {
    is_active:
      query.is_active === undefined
        ? "all"
        : query.is_active
          ? "active"
          : "inactive",
    search: query.search ?? "",
    stars: query.stars === undefined ? "all" : `${query.stars}`,
  };
}

export {
  DEFAULT_HOTELS_LIST_FILTERS,
  hotelsQueryToFilters,
  normalizeHotelsSearch,
  type HotelsListFilters,
};
