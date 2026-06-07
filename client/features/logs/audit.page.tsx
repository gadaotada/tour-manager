import { useLoaderData, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";

import { UI_TABLE_NAMES, type ListAuditLogsQuery } from "@tour-manager/shared";

import { ListPageSection } from "@components/data";
import { TableColumnVisibilityMenu, useTableSettings } from "@features/settings";
import { useT } from "@libs/i18n";

import { AuditPagination } from "./audit-pagination";
import {
  DEFAULT_AUDIT_LIST_FILTERS,
  auditQueryToFilters,
  normalizeAuditSearch,
  type AuditListFilters,
} from "./audit.query";
import { areAuditQueriesEqual } from "./audit.helpers";
import { AUDIT_TABLE_VISIBILITY_COLUMNS, AuditTable } from "./audit-table";
import { AuditToolbar } from "./audit-toolbar";

function AuditsPage() {
  const t = useT();
  const navigate = useNavigate({ from: "/logs" });
  const query = useSearch({ from: "/_shell/logs" });
  const result = useLoaderData({ from: "/_shell/logs" });
  const isLoading = useRouterState({
    select: (state) => state.status === "pending",
  });
  const filters = auditQueryToFilters(query);
  const tableSettings = useTableSettings(UI_TABLE_NAMES.LOGS);
  const showInitialLoading = isLoading && !result;

  function updateSearch(next: Partial<ListAuditLogsQuery>) {
    const nextQuery = normalizeAuditSearch({ ...query, ...next });

    if (areAuditQueriesEqual(query, nextQuery)) {
      return;
    }

    navigate({
      search: () => nextQuery,
    }).catch((error: unknown) => {
      console.error("Failed to update audit search params:", error);
    });
  }

  function setSearch(search: string) {
    updateSearch({ page: 1, search: search || undefined });
  }

  function setAction(action: AuditListFilters["action"]) {
    updateSearch({
      page: 1,
      action: action === "all" ? undefined : action,
    });
  }

  function setResource(resource: AuditListFilters["resource"]) {
    updateSearch({
      page: 1,
      resource: resource === "all" ? undefined : resource,
    });
  }

  function setResourceId(resource_id: string) {
    updateSearch({
      page: 1,
      resource_id: resource_id.trim() || undefined,
    });
  }

  function setSort(sort_by: ListAuditLogsQuery["sort_by"]) {
    updateSearch({
      page: 1,
      sort_by,
      sort_dir: query.sort_by === sort_by && query.sort_dir === "DESC" ? "ASC" : "DESC",
    });
  }

  function resetFilters() {
    const nextQuery = normalizeAuditSearch({
      page: 1,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_dir: query.sort_dir,
    });

    if (
      filters.search === DEFAULT_AUDIT_LIST_FILTERS.search &&
      filters.action === DEFAULT_AUDIT_LIST_FILTERS.action &&
      filters.resource === DEFAULT_AUDIT_LIST_FILTERS.resource &&
      filters.resource_id === DEFAULT_AUDIT_LIST_FILTERS.resource_id &&
      query.page === nextQuery.page
    ) {
      return;
    }

    navigate({
      search: () => nextQuery,
    }).catch((error: unknown) => {
      console.error("Failed to reset audit filters:", error);
    });
  }

  return (
    <ListPageSection
      loading={showInitialLoading}
      loadingMessage={t("logs.list.loading")}
      empty={Boolean(result && result.data.length === 0)}
      emptyMessage={t("logs.list.empty")}
      toolbar={
        <AuditToolbar
          filters={filters}
          columnVisibility={
            <TableColumnVisibilityMenu
              columns={AUDIT_TABLE_VISIBILITY_COLUMNS}
              hiddenColumns={tableSettings.hiddenColumns}
              saving={tableSettings.saving}
              onHiddenColumnsChange={tableSettings.setHiddenColumns}
            />
          }
          onActionChange={setAction}
          onResourceChange={setResource}
          onResourceIdChange={setResourceId}
          onReset={resetFilters}
          onSearchChange={setSearch}
        />
      }
      pagination={
        result ? (
          <AuditPagination
            onPageChange={(page) => updateSearch({ page })}
            onPageSizeChange={(page_size) => updateSearch({ page: 1, page_size })}
          />
        ) : null
      }
    >
      <AuditTable
        hiddenColumns={tableSettings.hiddenColumns}
        onSort={setSort}
      />
    </ListPageSection>
  );
}

export { AuditsPage };
