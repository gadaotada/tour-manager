import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useRef, useState } from "react";

import type { ListUsersQuery, ManagedUser } from "@tour-manager/shared";

import {
  ConfirmDialog,
  useConfirmAction,
  useRowActionMenu,
} from "@components/data";
import { ApiClientError } from "@libs/api";
import { useT } from "@libs/i18n";
import { toast } from "@libs/toasts";
import { cn } from "@libs/utils";

import { deleteUser, updateUserStatus } from "./users.api";
import { useUsersTableColumns } from "./components/users-table-columns";
import { UsersRowMenu } from "./components/users-row-menu";
import { useUserPermissions } from "./use-user-permissions";
import { useUsersRows, useUsersSort } from "./users.store";

type UsersTableProps = {
  onEdit: (user: ManagedUser) => void;
  onRefresh: () => void;
  onSort: (column: ListUsersQuery["sort_by"]) => void;
};

function UsersTable({ onEdit, onRefresh, onSort }: UsersTableProps) {
  const t = useT();
  const users = useUsersRows();
  const sort = useUsersSort();
  const { canDeleteUser, canUpdateUser } = useUserPermissions();
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const rowActions = useRowActionMenu<ManagedUser>({ enabled: true });
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const deleteAction = useConfirmAction<ManagedUser>({
    onConfirm: (user) => deleteUser(user.id),
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError ? error.message : t("users.table.error.delete"),
      );
    },
    onSuccess: onRefresh,
  });
  const columns = useUsersTableColumns();

  async function handleStatusChange(user: ManagedUser) {
    if (!canUpdateUser(user)) return;

    rowActions.closeMenu();
    setPendingUserId(user.id);

    try {
      await updateUserStatus(user.id, { is_enabled: !user.is_enabled });
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("users.table.error.status"));
      onRefresh();
    } finally {
      setPendingUserId(null);
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  data-state={rowActions.selectedItem?.id === user.id ? "selected" : undefined}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5 dark:data-[state=selected]:bg-primary/10"
                  onClick={(event) => rowActions.openMenu(event, user)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${user.id}-${column.id}`}
                      className={cn(
                        "border-b px-4 py-3 align-middle whitespace-nowrap",
                        column.className,
                      )}
                    >
                      {column.render(user)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rowActions.menu ? (
        <UsersRowMenu
          anchorCell={rowActions.menu.anchorCell}
          canDelete={canDeleteUser(rowActions.menu.item)}
          canUpdate={canUpdateUser(rowActions.menu.item)}
          isStatusPending={pendingUserId === rowActions.menu.item.id}
          tableViewport={tableViewportRef.current}
          user={rowActions.menu.item}
          onClose={rowActions.closeMenu}
          onDelete={(user) => {
            rowActions.closeMenu();
            deleteAction.request(user);
          }}
          onEdit={(user) => {
            rowActions.closeMenu();
            onEdit(user);
          }}
          onToggleStatus={handleStatusChange}
        />
      ) : null}

      <ConfirmDialog
        open={deleteAction.target !== null}
        title={t("users.delete.title")}
        description={t("users.delete.description").replace(
          "{name}",
          deleteAction.target?.display_name ?? "",
        )}
        confirmLabel={t("users.delete.confirm")}
        cancelLabel={t("common.actions.cancel")}
        loading={deleteAction.loading}
        onConfirm={deleteAction.confirm}
        onOpenChange={deleteAction.setOpen}
      />
    </>
  );
}

export { UsersTable };
