import { ROLES, USER_SORT_BY_COLS, type ListUsersQuery } from "@tour-manager/shared";
import {
  createSortedListSearchNormalizer,
  normalizeBooleanSearchParam,
  normalizeStringSearchParam,
} from "@libs/search-params";

type UsersListFilters = {
  is_enabled: "all" | "enabled" | "disabled";
  role: "all" | typeof ROLES.ADMIN | typeof ROLES.MODERATOR | typeof ROLES.EMPLOYEE;
  search: string;
};

const DEFAULT_USERS_LIST_FILTERS = {
  is_enabled: "all",
  role: "all",
  search: "",
} satisfies UsersListFilters;

const usersListSearch = createSortedListSearchNormalizer<ListUsersQuery["sort_by"]>({
  defaultSortBy: "created_at",
  defaultSortDir: "DESC",
  sortByValues: USER_SORT_BY_COLS,
});

function normalizeUsersSearch(raw: Record<string, unknown>): ListUsersQuery {
  const baseQuery = usersListSearch.normalizeBaseListSearch(raw);
  const role = normalizeStringSearchParam(raw.role);
  const search = normalizeStringSearchParam(raw.search);
  const is_enabled = normalizeBooleanSearchParam(raw.is_enabled);

  return {
    ...baseQuery,
    ...(search ? { search } : {}),
    ...(role === ROLES.ADMIN || role === ROLES.MODERATOR || role === ROLES.EMPLOYEE ? { role } : {}),
    ...(is_enabled !== undefined ? { is_enabled } : {}),
  };
}

function usersQueryToFilters(query: ListUsersQuery): UsersListFilters {
  return {
    search: query.search ?? "",
    role: query.role ?? "all",
    is_enabled:
      query.is_enabled === undefined
        ? "all"
        : query.is_enabled
          ? "enabled"
          : "disabled",
  };
}

export {
  DEFAULT_USERS_LIST_FILTERS,
  normalizeUsersSearch,
  usersQueryToFilters,
  type UsersListFilters,
};
