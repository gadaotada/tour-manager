import type { Permission } from "@tour-manager/shared";
import { useMemo } from "react";

import {
  DataTable,
  SortableColumnHeader,
  type DataTableColumnDef,
} from "@components/data";
import { useT } from "@libs/i18n";

import { PermissionOverrideControl } from "./permission-override-control";
import type {
  OverrideValue,
  PermissionSortBy,
  PermissionSortDir,
  PermissionTableRow,
} from "./permissions-editor.types";

type PermissionsTableProps = {
  canManagePermissions: boolean;
  rows: PermissionTableRow[];
  saving: boolean;
  sortBy: PermissionSortBy;
  sortDir: PermissionSortDir;
  onOverrideChange: (permission: Permission, value: OverrideValue) => void;
  onSort: (sortBy: PermissionSortBy) => void;
};

function PermissionsTable({
  canManagePermissions,
  rows,
  saving,
  sortBy,
  sortDir,
  onOverrideChange,
  onSort,
}: PermissionsTableProps) {
  const t = useT();
  const columns = useMemo(
    (): DataTableColumnDef<PermissionTableRow>[] => [
      {
        id: "permission",
        header: () => (
          <SortableColumnHeader
            active={sortBy === "permission"}
            dir={sortDir}
            label={t("users.detail.permissions.permission")}
            onClick={() => onSort("permission")}
          />
        ),
        cell: ({ row }) => row.original.permission,
        meta: getPermissionTableMeta("font-mono text-xs"),
      },
      {
        id: "default",
        header: () => (
          <SortableColumnHeader
            active={sortBy === "default"}
            dir={sortDir}
            label={t("users.detail.permissions.default")}
            onClick={() => onSort("default")}
          />
        ),
        cell: ({ row }) =>
          row.original.defaultAllowed
            ? t("users.detail.permissions.allowed")
            : t("users.detail.permissions.denied"),
        meta: getPermissionTableMeta(),
      },
      {
        id: "override",
        header: () => (
          <SortableColumnHeader
            active={sortBy === "override"}
            dir={sortDir}
            label={t("users.detail.permissions.override")}
            onClick={() => onSort("override")}
          />
        ),
        cell: ({ row }) => (
          <PermissionOverrideControl
            disabled={!canManagePermissions || saving}
            value={row.original.override}
            onChange={(value) => onOverrideChange(row.original.permission, value)}
          />
        ),
        meta: getPermissionTableMeta(),
      },
    ],
    [canManagePermissions, onOverrideChange, onSort, saving, sortBy, sortDir, t],
  );

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="relative max-h-125 overflow-auto">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.permission}
          headerRowClassName="border-b"
          tableClassName="w-full min-w-190 caption-bottom border-separate border-spacing-0 text-sm/relaxed"
          tableHeaderClassName="sticky top-0 z-10 bg-surface-muted text-left"
        />
      </div>
    </div>
  );
}

function getPermissionTableMeta(cellClassName = "") {
  return {
    cellClassName: `border-b px-4 py-3 align-middle whitespace-nowrap ${cellClassName}`.trim(),
    headerClassName:
      "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
  };
}

export { PermissionsTable };
