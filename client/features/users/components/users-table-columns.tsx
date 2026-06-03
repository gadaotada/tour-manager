import { USER_SORT_BY_COLS, type ListUsersQuery, type ManagedUser } from "@tour-manager/shared";

import {
  ActiveStateBadge,
  SortableColumnHeader,
  type DataTableColumnDef,
} from "@components/data";
import { useLocaleStore, useT, type MessageKey } from "@libs/i18n";
import { formatDateTime } from "@libs/utils";

const USER_COLUMN_LABEL_KEYS: Record<ListUsersQuery["sort_by"], MessageKey> = {
  username: "users.columns.username",
  display_name: "users.columns.display_name",
  role: "users.columns.role",
  is_enabled: "users.columns.is_enabled",
  created_at: "users.columns.created_at",
  updated_at: "users.columns.updated_at",
};

const USER_TABLE_COLUMN_IDS = USER_SORT_BY_COLS.filter((column) =>
  ["username", "display_name", "role", "is_enabled", "created_at", "updated_at"].includes(column),
);

type UseUsersTableColumnsParams = {
  onSort: (column: ListUsersQuery["sort_by"]) => void;
  sort: Pick<ListUsersQuery, "sort_by" | "sort_dir"> | null;
};

function useUsersTableColumns({
  onSort,
  sort,
}: UseUsersTableColumnsParams): DataTableColumnDef<ManagedUser>[] {
  const t = useT();
  const locale = useLocaleStore((state) => state.locale);

  return USER_TABLE_COLUMN_IDS.map((columnId) => ({
    id: columnId,
    header: () => (
      <SortableColumnHeader
        active={sort?.sort_by === columnId}
        dir={sort?.sort_dir ?? "ASC"}
        label={t(USER_COLUMN_LABEL_KEYS[columnId])}
        onClick={() => onSort(columnId)}
      />
    ),
    cell: ({ row }) => {
      const user = row.original;

      switch (columnId) {
        case "username":
          return <span className="block min-w-0 truncate font-medium">{user.username}</span>;
        case "display_name":
          return <span className="block min-w-0 truncate">{user.display_name}</span>;
        case "role":
          return t(`users.roles.${user.role}`);
        case "is_enabled":
          return (
            <ActiveStateBadge
              activeLabel={t("users.filters.enabled")}
              inactiveLabel={t("users.filters.disabled")}
              isActive={user.is_enabled}
            />
          );
        case "created_at":
          return formatDateTime(user.created_at, locale);
        case "updated_at":
          return formatDateTime(user.updated_at, locale);
        default:
          return null;
      }
    },
    meta: {
      className:
        columnId === "is_enabled" || columnId === "role"
          ? "w-32"
          : columnId === "created_at" || columnId === "updated_at"
            ? "w-44"
            : undefined,
      cellClassName: "border-b px-4 py-3 align-middle whitespace-nowrap",
      headerClassName:
        "border-b px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
    },
  }));
}

export { useUsersTableColumns };
