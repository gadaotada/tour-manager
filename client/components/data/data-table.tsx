import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type React from "react";

import { cn } from "@libs/utils";

type DataTableColumnMeta = {
  cellClassName?: string;
  className?: string;
  headerClassName?: string;
};

type DataTableColumnDef<TData> = ColumnDef<TData, unknown> & {
  meta?: DataTableColumnMeta;
};

type DataTableProps<TData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  headerRowClassName?: string;
  onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: TData) => void;
  rowClassName?: (row: TData) => string | undefined;
  rowState?: (row: TData) => string | undefined;
  tableClassName: string;
  tableHeaderClassName: string;
  tableBodyClassName?: string;
};

function getColumnMeta<TData>(
  columnDef: ColumnDef<TData, unknown>,
): DataTableColumnMeta | undefined {
  return columnDef.meta;
}

function DataTable<TData>({
  columns,
  data,
  getRowId,
  headerRowClassName,
  onRowClick,
  rowClassName,
  rowState,
  tableBodyClassName,
  tableClassName,
  tableHeaderClassName,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  return (
    <table className={tableClassName}>
      <thead className={tableHeaderClassName}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={headerRowClassName}>
            {headerGroup.headers.map((header) => {
              const meta = getColumnMeta(header.column.columnDef);

              return (
                <th
                  key={header.id}
                  className={cn(meta?.className, meta?.headerClassName)}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody className={tableBodyClassName}>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            data-state={rowState?.(row.original)}
            className={rowClassName?.(row.original)}
            onClick={
              onRowClick
                ? (event) => {
                    onRowClick(event, row.original);
                  }
                : undefined
            }
          >
            {row.getVisibleCells().map((cell) => {
              const meta = getColumnMeta(cell.column.columnDef);

              return (
                <td key={cell.id} className={cn(meta?.className, meta?.cellClassName)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { DataTable, type DataTableColumnDef };
