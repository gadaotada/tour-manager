import { useState } from "react";
import { useLoaderData, useNavigate, useRouter, useRouterState, useSearch } from "@tanstack/react-router";

import type { ListUsersQuery, ManagedUser } from "@tour-manager/shared";

import { ListPageSection } from "@components/data";
import { useT } from "@libs/i18n";

import { UsersPagination } from "./components/users-pagination";
import { UsersToolbar } from "./components/users-toolbar";
import { UserFormDialog } from "./user-form-dialog";
import { useUserPermissions } from "./use-user-permissions";
import { useUsersRealtime } from "./use-users-realtime";
import {
  DEFAULT_USERS_LIST_FILTERS,
  normalizeUsersSearch,
  usersQueryToFilters,
  type UsersListFilters,
} from "./users.query";
import { UsersTable } from "./users-table";

function UsersPage() {
  const t = useT();
  const router = useRouter();
  const navigate = useNavigate({ from: "/users" });
  const query = useSearch({ from: "/_shell/users" });
  const result = useLoaderData({ from: "/_shell/users" });
  const isLoading = useRouterState({
    select: (state) => state.status === "pending",
  });
  const { canCreateUser } = useUserPermissions();
  const filters = usersQueryToFilters(query);
  const showInitialLoading = isLoading && !result;
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  useUsersRealtime(() => {
    refreshUsers();
  });

  function openCreateDialog() {
    setFormMode("create");
    setSelectedUser(null);
    setFormOpen(true);
  }

  function openEditDialog(targetUser: ManagedUser) {
    setFormMode("edit");
    setSelectedUser(targetUser);
    setFormOpen(true);
  }

  function openUserDetail(targetUser: ManagedUser) {
    navigate({
      to: "/users/$userId",
      params: { userId: targetUser.id },
      search: {},
    }).catch((error: unknown) => {
      console.error("Failed to open user detail:", error);
    });
  }

  function updateSearch(next: Partial<ListUsersQuery>) {
    const nextQuery = normalizeUsersSearch({ ...query, ...next });

    if (areUsersQueriesEqual(query, nextQuery)) {
      return;
    }

    navigate({
      search: () => nextQuery,
    }).catch((error: unknown) => {
      console.error("Failed to update users search params:", error);
    });
  }

  function refreshUsers() {
    router.invalidate().catch((error: unknown) => {
      console.error("Failed to refresh users:", error);
    });
  }

  function setSearch(search: string) {
    updateSearch({ page: 1, search: search || undefined });
  }

  function setRole(role: UsersListFilters["role"]) {
    updateSearch({
      page: 1,
      role: role === "all" ? undefined : role,
    });
  }

  function setIsEnabled(is_enabled: UsersListFilters["is_enabled"]) {
    updateSearch({
      page: 1,
      is_enabled:
        is_enabled === "all"
          ? undefined
          : is_enabled === "enabled",
    });
  }

  function setSort(sort_by: ListUsersQuery["sort_by"]) {
    updateSearch({
      page: 1,
      sort_by,
      sort_dir: query.sort_by === sort_by && query.sort_dir === "DESC" ? "ASC" : "DESC",
    });
  }

  function resetFilters() {
    const nextQuery = normalizeUsersSearch({
      page: 1,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_dir: query.sort_dir,
    });

    if (
      filters.search === DEFAULT_USERS_LIST_FILTERS.search &&
      filters.role === DEFAULT_USERS_LIST_FILTERS.role &&
      filters.is_enabled === DEFAULT_USERS_LIST_FILTERS.is_enabled &&
      query.page === nextQuery.page
    ) {
      return;
    }

    navigate({
      search: () => nextQuery,
    }).catch((error: unknown) => {
      console.error("Failed to reset users filters:", error);
    });
  }

  return (
    <>
      <ListPageSection
        loading={showInitialLoading}
        loadingMessage={t("users.list.loading")}
        empty={Boolean(result && result.data.length === 0)}
        emptyMessage={t("users.list.empty")}
        toolbar={
          <UsersToolbar
            filters={filters}
            canCreate={canCreateUser}
            onCreate={openCreateDialog}
            onIsEnabledChange={setIsEnabled}
            onReset={resetFilters}
            onRoleChange={setRole}
            onSearchChange={setSearch}
          />
        }
        pagination={
          result ? (
            <UsersPagination
              page={result.page}
              pageSize={result.page_size}
              lastPage={result.last_page}
              total={result.total}
              onPageChange={(page) => updateSearch({ page })}
              onPageSizeChange={(page_size) => updateSearch({ page: 1, page_size })}
            />
          ) : null
        }
      >
        <UsersTable
          onEdit={openEditDialog}
          onRefresh={refreshUsers}
          onSort={setSort}
          onView={openUserDetail}
        />
      </ListPageSection>

      <UserFormDialog
        mode={formMode}
        open={formOpen}
        user={selectedUser}
        onOpenChange={setFormOpen}
        onSuccess={refreshUsers}
      />
    </>
  );
}

function areUsersQueriesEqual(left: ListUsersQuery, right: ListUsersQuery): boolean {
  return (
    left.page === right.page &&
    left.page_size === right.page_size &&
    left.search === right.search &&
    left.role === right.role &&
    left.is_enabled === right.is_enabled &&
    left.sort_by === right.sort_by &&
    left.sort_dir === right.sort_dir
  );
}

export { UsersPage };
