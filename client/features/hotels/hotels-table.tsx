import { ArrowDownIcon, ArrowUpIcon, PenIcon, PowerIcon, TrashIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  HOTEL_SORT_BY_COLS,
  PERMISSIONS,
  hasPermission,
  type Hotel,
  type ListHotelsQuery,
} from "@tour-manager/shared";

import {
  ActiveStateBadge,
  AnchoredRowMenu,
  ConfirmDialog,
  RowMenuButton,
  useConfirmAction,
  useRowActionMenu,
} from "@components/data";
import { Button } from "@components/ui/button";
import { useAuthUser } from "@core/stores";
import type { TableColumnVisibilityColumn } from "@features/settings";
import { ApiClientError } from "@libs/api";
import { useLocaleStore, useT, type MessageKey } from "@libs/i18n";
import { toast } from "@libs/toasts";
import { cn, formatDateTime } from "@libs/utils";

import { HotelStars } from "./hotel-stars";
import { deleteHotel, updateHotelStatus } from "./hotels.api";
import { useHotelsRows, useHotelsSort } from "./hotels.store";

type HotelsTableProps = {
  hiddenColumns?: readonly string[];
  onEdit: (hotel: Hotel) => void;
  onRefresh: () => void;
  onSort: (column: ListHotelsQuery["sort_by"]) => void;
};

type HotelColumn = {
  className?: string;
  id: ListHotelsQuery["sort_by"];
  labelKey: MessageKey;
  render: (hotel: Hotel) => React.ReactNode;
};

const HOTEL_COLUMN_LABEL_KEYS: Record<ListHotelsQuery["sort_by"], MessageKey> = {
  address: "hotels.columns.address",
  created_at: "hotels.columns.created_at",
  is_active: "hotels.columns.is_active",
  name: "hotels.columns.name",
  stars: "hotels.columns.stars",
  updated_at: "hotels.columns.updated_at",
};

const HOTEL_TABLE_COLUMN_IDS = HOTEL_SORT_BY_COLS.filter((column) =>
  ["name", "address", "stars", "is_active", "created_at", "updated_at"].includes(column),
);

const HOTEL_TABLE_VISIBILITY_COLUMNS = HOTEL_TABLE_COLUMN_IDS.map((columnId) => ({
  id: columnId,
  labelKey: HOTEL_COLUMN_LABEL_KEYS[columnId],
})) satisfies TableColumnVisibilityColumn<ListHotelsQuery["sort_by"]>[];

function HotelsTable({ hiddenColumns = [], onEdit, onRefresh, onSort }: HotelsTableProps) {
  const t = useT();
  const hotels = useHotelsRows();
  const sort = useHotelsSort();
  const locale = useLocaleStore((state) => state.locale);
  const user = useAuthUser();
  const canUpdate = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.UPDATE_ANY) : false;
  const canDelete = user ? hasPermission(user.permissions, PERMISSIONS.HOTELS.DELETE_ANY) : false;
  const hasRowActions = canUpdate || canDelete;
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const rowActions = useRowActionMenu<Hotel>({ enabled: hasRowActions });
  const deleteAction = useConfirmAction<Hotel>({
    onConfirm: (hotel) => deleteHotel(hotel.id),
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError ? error.message : t("hotels.table.error.delete"),
      );
    },
    onSuccess: onRefresh,
  });

  const [pendingHotelId, setPendingHotelId] = useState<number | null>(null);
  const hiddenColumnSet = useMemo(() => new Set(hiddenColumns), [hiddenColumns]);

  const columns = useMemo(
    (): HotelColumn[] =>
      HOTEL_TABLE_COLUMN_IDS.filter((columnId) => !hiddenColumnSet.has(columnId)).map(
        (columnId) => ({
          id: columnId,
          labelKey: HOTEL_COLUMN_LABEL_KEYS[columnId],
          className:
            columnId === "is_active"
              ? "w-28"
              : columnId === "stars"
                ? "w-20"
                : columnId === "created_at" || columnId === "updated_at"
                  ? "w-44"
                  : columnId === "address"
                    ? "min-w-96"
                  : undefined,
          render: (hotel) => {
            switch (columnId) {
              case "name":
                return <span className="block min-w-0 truncate font-medium">{hotel.name}</span>;
              case "address":
                return <span className="block min-w-0 truncate">{hotel.address}</span>;
              case "stars":
                return <HotelStars value={hotel.stars} />;
              case "is_active":
                return (
                  <ActiveStateBadge
                    activeLabel={t("hotels.filters.active")}
                    inactiveLabel={t("hotels.filters.inactive")}
                    isActive={hotel.is_active}
                  />
                );
              case "created_at":
                return formatDateTime(hotel.created_at, locale);
              case "updated_at":
                return formatDateTime(hotel.updated_at, locale);
              default:
                return null;
            }
          },
        }),
      ),
    [hiddenColumnSet, locale, t],
  );

  async function handleStatusChange(hotel: Hotel) {
    if (!canUpdate) return;

    rowActions.closeMenu();
    setPendingHotelId(hotel.id);

    try {
      await updateHotelStatus(hotel.id, {
        version: hotel.version,
        is_active: !hotel.is_active,
      });
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("hotels.table.error.status"));
      onRefresh();
    } finally {
      setPendingHotelId(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border bg-card">
        <div ref={tableViewportRef} className="relative max-h-[65vh] min-h-64 overflow-auto">
          <table className="w-full min-w-190 caption-bottom border-separate border-spacing-0 text-sm/relaxed">
            <thead className="sticky top-0 z-10 bg-surface-muted text-left">
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
                      column.className,
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        sort?.sort_by === column.id && "text-foreground",
                      )}
                      onClick={() => onSort(column.id)}
                    >
                      {t(column.labelKey)}
                      {sort?.sort_by === column.id ? (
                        sort.sort_dir === "DESC" ? (
                          <ArrowDownIcon className="size-3.5 shrink-0 opacity-70" />
                        ) : (
                          <ArrowUpIcon className="size-3.5 shrink-0 opacity-70" />
                        )
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr
                  key={hotel.id}
                  data-state={rowActions.selectedItem?.id === hotel.id ? "selected" : undefined}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10",
                    hasRowActions && "cursor-pointer",
                  )}
                  onClick={(event) => rowActions.openMenu(event, hotel)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${hotel.id}-${column.id}`}
                      className={cn(
                        "border-b px-4 py-3 align-middle whitespace-nowrap",
                        column.className,
                      )}
                    >
                      {column.render(hotel)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rowActions.menu ? (
        <HotelsRowMenu
          canDelete={canDelete}
          canUpdate={canUpdate}
          hotel={rowActions.menu.item}
          anchorCell={rowActions.menu.anchorCell}
          isStatusPending={pendingHotelId === rowActions.menu.item.id}
          tableViewport={tableViewportRef.current}
          onClose={rowActions.closeMenu}
          onDelete={(hotel) => {
            rowActions.closeMenu();
            deleteAction.request(hotel);
          }}
          onEdit={(hotel) => {
            rowActions.closeMenu();
            onEdit(hotel);
          }}
          onToggleStatus={handleStatusChange}
        />
      ) : null}

      <ConfirmDialog
        open={deleteAction.target !== null}
        title={t("hotels.delete.title")}
        description={t("hotels.delete.description").replace(
          "{name}",
          deleteAction.target?.name ?? "",
        )}
        confirmLabel={t("hotels.delete.confirm")}
        cancelLabel={t("common.actions.cancel")}
        loading={deleteAction.loading}
        onConfirm={deleteAction.confirm}
        onOpenChange={deleteAction.setOpen}
      />
    </>
  );
}

type HotelsRowMenuProps = {
  anchorCell: HTMLTableCellElement;
  canDelete: boolean;
  canUpdate: boolean;
  hotel: Hotel;
  isStatusPending: boolean;
  onClose: () => void;
  onDelete: (hotel: Hotel) => void;
  onEdit: (hotel: Hotel) => void;
  onToggleStatus: (hotel: Hotel) => void;
  tableViewport: HTMLDivElement | null;
};

function HotelsRowMenu({
  anchorCell,
  canDelete,
  canUpdate,
  hotel,
  isStatusPending,
  onClose,
  onDelete,
  onEdit,
  onToggleStatus,
  tableViewport,
}: HotelsRowMenuProps) {
  const t = useT();

  return (
    <AnchoredRowMenu
      anchorCell={anchorCell}
      menuAttribute="data-hotels-row-menu"
      onClose={onClose}
      tableViewport={tableViewport}
    >
      {canUpdate ? (
        <>
          <RowMenuButton onClick={() => onEdit(hotel)}>
            <PenIcon className="size-4" />
            {t("hotels.actions.edit")}
          </RowMenuButton>
          <RowMenuButton disabled={isStatusPending} onClick={() => onToggleStatus(hotel)}>
            <PowerIcon className="size-4" />
            {t("hotels.actions.toggleStatus")}
          </RowMenuButton>
        </>
      ) : null}

      {canDelete ? (
        <RowMenuButton destructive onClick={() => onDelete(hotel)}>
          <TrashIcon className="size-4" />
          {t("hotels.actions.delete")}
        </RowMenuButton>
      ) : null}
    </AnchoredRowMenu>
  );
}

export { HOTEL_TABLE_VISIBILITY_COLUMNS, HotelsTable };
