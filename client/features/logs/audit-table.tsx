import { useMemo, useRef, useState } from "react";

import type { AuditLog, ListAuditLogsQuery } from "@tour-manager/shared";

import {
  DataTable,
  SortableColumnHeader,
  useRowActionMenu,
  type DataTableColumnDef,
} from "@components/data";
import { useLocaleStore, useT, type MessageKey } from "@libs/i18n";
import { formatDateTime } from "@libs/utils";

import {
  AUDIT_TABLE_VISIBILITY_COLUMNS,
  getAuditActionClassName,
  getVisibleAuditTableColumns,
  isSortableAuditColumn,
  type AuditSort,
  type AuditTableColumn,
} from "./audit.helpers";
import { AuditDetailsDialog } from "./audit-details-dialog";
import { AuditRowMenu } from "./audit-row-menu";
import { useAuditRows, useAuditSort } from "./audit.store";

type AuditTableProps = {
  hiddenColumns?: readonly string[];
  onSort: (column: ListAuditLogsQuery["sort_by"]) => void;
};

function AuditTable({ hiddenColumns = [], onSort }: AuditTableProps) {
  const t = useT();
  const locale = useLocaleStore((state) => state.locale);
  const audits = useAuditRows();
  const sort = useAuditSort();
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const rowActions = useRowActionMenu<AuditLog>({ enabled: true });
  const [detailsAudit, setDetailsAudit] = useState<AuditLog | null>(null);
  const visibleColumns = useMemo(
    () => getVisibleAuditTableColumns(hiddenColumns),
    [hiddenColumns],
  );

  const columns = useMemo(
    (): DataTableColumnDef<AuditLog>[] =>
      visibleColumns.map((column) => ({
        id: column.id,
        header: () => renderHeader(column, sort, onSort, t),
        cell: ({ row }) => {
          const audit = row.original;

          switch (column.id) {
            case "created_at":
              return formatDateTime(audit.created_at, locale);
            case "actor_display_name":
              return (
                <div className="min-w-0">
                  <span className="block truncate font-medium">{audit.actor_display_name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {audit.actor_username}
                  </span>
                </div>
              );
            case "action":
              return (
                <span className={`inline-flex h-6 items-center rounded-full px-2 text-sm font-medium ${getAuditActionClassName(audit.action)}`}>
                  {t(`logs.actions.${audit.action}` as MessageKey)}
                </span>
              );
            case "resource":
              return t(`logs.resources.${audit.resource}` as MessageKey);
            case "resource_id":
              return (
                <span className="block min-w-0 truncate">
                  {audit.resource_id ?? t("logs.table.noResourceId")}
                </span>
              );
            default:
              return null;
          }
        },
        meta: {
          cellClassName: "border-b px-4 py-3 align-middle whitespace-nowrap",
          headerClassName:
            "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
        },
      })),
    [locale, onSort, sort, t, visibleColumns],
  );

  return (
    <>
      <div className="overflow-hidden rounded-md border bg-card">
        <div ref={tableViewportRef} className="relative max-h-[65vh] min-h-64 overflow-auto">
          <DataTable
            columns={columns}
            data={audits}
            getRowId={(audit) => String(audit.id)}
            headerRowClassName="border-b"
            rowClassName={() =>
              "cursor-pointer border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10"
            }
            rowState={(audit) =>
              rowActions.selectedItem?.id === audit.id ? "selected" : undefined
            }
            tableClassName="w-full caption-bottom border-separate border-spacing-0 text-sm/relaxed"
            tableHeaderClassName="sticky top-0 z-10 bg-surface-muted text-left"
            onRowClick={(event, audit) => rowActions.openMenu(event, audit)}
          />
        </div>
      </div>

      {rowActions.menu ? (
        <AuditRowMenu
          anchorCell={rowActions.menu.anchorCell}
          audit={rowActions.menu.item}
          tableViewport={tableViewportRef.current}
          onClose={rowActions.closeMenu}
          onViewDetails={(audit) => {
            rowActions.closeMenu();
            setDetailsAudit(audit);
          }}
        />
      ) : null}

      <AuditDetailsDialog
        audit={detailsAudit}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsAudit(null);
          }
        }}
      />
    </>
  );
}

function renderHeader(
  column: AuditTableColumn,
  sort: AuditSort | null,
  onSort: (column: ListAuditLogsQuery["sort_by"]) => void,
  t: (key: MessageKey) => string,
) {
  if (isSortableAuditColumn(column.id)) {
    const sortableColumnId = column.id;

    return (
      <SortableColumnHeader
        active={sort?.sort_by === sortableColumnId}
        dir={sort?.sort_dir ?? "ASC"}
        label={t(column.labelKey)}
        onClick={() => onSort(sortableColumnId)}
      />
    );
  }

  return t(column.labelKey);
}

export { AUDIT_TABLE_VISIBILITY_COLUMNS, AuditTable };
