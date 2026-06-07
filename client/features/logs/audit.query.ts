import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  AUDIT_SORT_BY_COLS,
  type AuditAction,
  type AuditResource,
  type ListAuditLogsQuery,
} from "@tour-manager/shared";

import {
  createSortedListSearchNormalizer,
  normalizeStringSearchParam,
} from "@libs/search-params";

const auditListSearch = createSortedListSearchNormalizer<ListAuditLogsQuery["sort_by"]>({
  defaultSortBy: "created_at",
  defaultSortDir: "DESC",
  sortByValues: AUDIT_SORT_BY_COLS,
});

const DEFAULT_AUDIT_LIST_FILTERS: AuditListFilters = {
  action: "all",
  resource: "all",
  resource_id: "",
  search: "",
  user_id: "",
};

type AuditListFilters = {
  action: "all" | AuditAction;
  resource: "all" | AuditResource;
  resource_id: string;
  search: string;
  user_id: string;
};

function normalizeAuditSearch(raw: Record<string, unknown>): ListAuditLogsQuery {
  const baseQuery = auditListSearch.normalizeBaseListSearch(raw);
  const search = normalizeStringSearchParam(raw.search);
  const action = normalizeOptionalEnumSearchParam<AuditAction>(raw.action, AUDIT_ACTIONS);
  const resource = normalizeOptionalEnumSearchParam<AuditResource>(raw.resource, AUDIT_RESOURCES);
  const user_id = normalizeStringSearchParam(raw.user_id);
  const resource_id = normalizeStringSearchParam(raw.resource_id);

  return {
    ...baseQuery,
    ...(search ? { search } : {}),
    ...(action ? { action } : {}),
    ...(resource ? { resource } : {}),
    ...(user_id ? { user_id } : {}),
    ...(resource_id ? { resource_id } : {}),
  };
}

function auditQueryToFilters(query: ListAuditLogsQuery): AuditListFilters {
  return {
    action: query.action ?? "all",
    resource: query.resource ?? "all",
    resource_id: query.resource_id ?? "",
    search: query.search ?? "",
    user_id: query.user_id ?? "",
  };
}

function normalizeOptionalEnumSearchParam<TValue extends string>(
  raw: unknown,
  values: readonly TValue[],
): TValue | undefined {
  return typeof raw === "string" && values.includes(raw as TValue)
    ? raw as TValue
    : undefined;
}

export { normalizeAuditSearch };
export {
  DEFAULT_AUDIT_LIST_FILTERS,
  auditQueryToFilters,
  type AuditListFilters,
};
