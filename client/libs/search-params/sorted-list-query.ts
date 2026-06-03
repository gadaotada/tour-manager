import {
  DEFAULT_TABLE_PAGE_SIZE,
  SORT_DIRS,
  TABLE_PAGE_SIZE_OPTIONS,
  type SortDir,
} from "@tour-manager/shared";

import {
  normalizeEnumSearchParam,
  normalizeIntegerSearchParam,
} from "./search-params";

type SortedListQuery<TSortBy extends string> = {
  page: number;
  page_size: number;
  sort_by: TSortBy;
  sort_dir: SortDir;
};

type SortedListQueryConfig<TSortBy extends string> = {
  defaultSortBy: TSortBy;
  defaultSortDir?: SortDir;
  sortByValues: readonly TSortBy[];
};

function createSortedListSearchNormalizer<TSortBy extends string>({
  defaultSortBy,
  defaultSortDir = "DESC",
  sortByValues,
}: SortedListQueryConfig<TSortBy>) {
  const defaultQuery: SortedListQuery<TSortBy> = {
    page: 1,
    page_size: DEFAULT_TABLE_PAGE_SIZE,
    sort_by: defaultSortBy,
    sort_dir: defaultSortDir,
  };

  function normalizeBaseListSearch(raw: Record<string, unknown>): SortedListQuery<TSortBy> {
    const page =
      normalizeIntegerSearchParam(raw.page, {
        fallback: defaultQuery.page,
        min: 1,
      }) ?? defaultQuery.page;

    return {
      page,
      page_size: normalizePageSize(raw.page_size, defaultQuery.page_size),
      sort_by: normalizeEnumSearchParam(raw.sort_by, {
        fallback: defaultQuery.sort_by,
        values: sortByValues,
      }),
      sort_dir: normalizeEnumSearchParam(raw.sort_dir, {
        fallback: defaultQuery.sort_dir,
        values: SORT_DIRS,
      }),
    };
  }

  return {
    defaultQuery,
    normalizeBaseListSearch,
  };
}

function normalizePageSize(raw: unknown, fallback = DEFAULT_TABLE_PAGE_SIZE): number {
  const value = Number(raw ?? fallback);
  if (TABLE_PAGE_SIZE_OPTIONS.includes(value as (typeof TABLE_PAGE_SIZE_OPTIONS)[number])) {
    return value;
  }

  return fallback;
}

export { createSortedListSearchNormalizer };
