import { AUDIT_SORT_BY_COLS, type AuditAction, type ListAuditLogsQuery } from "@tour-manager/shared";

import type { TableColumnVisibilityColumn } from "@features/settings";
import type { MessageKey } from "@libs/i18n";

type AuditSort = Pick<ListAuditLogsQuery, "sort_by" | "sort_dir">;

type AuditTableColumnId = ListAuditLogsQuery["sort_by"] | "resource_id";

type AuditTableColumn = {
  id: AuditTableColumnId;
  labelKey: MessageKey;
};

const AUDIT_SORTABLE_COLUMN_SET = new Set<string>(AUDIT_SORT_BY_COLS);

const AUDIT_TABLE_COLUMNS = [
  { id: "created_at", labelKey: "logs.columns.created_at" },
  { id: "action", labelKey: "logs.columns.action" },
  { id: "resource", labelKey: "logs.columns.resource" },
  { id: "actor_display_name", labelKey: "logs.columns.actor" },
  { id: "resource_id", labelKey: "logs.columns.resource_id" },
] as const satisfies readonly AuditTableColumn[];

const AUDIT_TABLE_VISIBILITY_COLUMNS = AUDIT_TABLE_COLUMNS.map((column) => ({
  id: column.id,
  labelKey: column.labelKey,
})) satisfies TableColumnVisibilityColumn<AuditTableColumnId>[];

function getVisibleAuditTableColumns(hiddenColumns: readonly string[]): readonly AuditTableColumn[] {
  const hiddenColumnSet = new Set(hiddenColumns);

  return AUDIT_TABLE_COLUMNS.filter((column) => !hiddenColumnSet.has(column.id));
}

function isSortableAuditColumn(
  columnId: AuditTableColumnId,
): columnId is ListAuditLogsQuery["sort_by"] {
  return AUDIT_SORTABLE_COLUMN_SET.has(columnId);
}

function areAuditQueriesEqual(left: ListAuditLogsQuery, right: ListAuditLogsQuery): boolean {
  const leftKeys = Object.keys(left) as (keyof ListAuditLogsQuery)[];
  const rightKeys = Object.keys(right) as (keyof ListAuditLogsQuery)[];

  return leftKeys.length === rightKeys.length && leftKeys.every((key) => left[key] === right[key]);
}

function getAuditActionClassName(action: AuditAction): string {
  switch (action) {
    case "CREATE":
      return "bg-success/15 text-success dark:bg-success/20 dark:text-success";
    case "UPDATE":
      return "bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning";
    case "DELETE":
      return "bg-error/10 text-error dark:bg-error/20 dark:text-error";
    case "OTHER":
      return "bg-info/10 text-info dark:bg-info/20 dark:text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export {
  AUDIT_TABLE_VISIBILITY_COLUMNS,
  areAuditQueriesEqual,
  getAuditActionClassName,
  getVisibleAuditTableColumns,
  isSortableAuditColumn,
  type AuditSort,
  type AuditTableColumn,
  type AuditTableColumnId,
};
