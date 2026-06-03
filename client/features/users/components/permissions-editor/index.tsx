import type { Permission, UserDetail } from "@tour-manager/shared";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@components/data";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useT } from "@libs/i18n";
import { toast } from "@libs/toasts";

import { useUserPermissions } from "../../use-user-permissions";
import { updateUserPermissions } from "../../users.api";
import {
  areOverrideMapsEqual,
  createPermissionRows,
  getCanManagePermissions,
  toOverrideMap,
  toPermissionOverrides,
} from "./permissions-editor.model";
import { PermissionsEditorActions } from "./permissions-editor-actions";
import { PermissionsTable } from "./permissions-table";
import type {
  OverrideValue,
  PermissionSortBy,
  PermissionSortDir,
} from "./permissions-editor.types";

type UserPermissionsEditorProps = {
  user: UserDetail;
};

function UserPermissionsEditor({ user }: UserPermissionsEditorProps) {
  const t = useT();
  const router = useRouter();
  const { actor, canUpdateAny, canUpdateNonAdmin } = useUserPermissions();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<PermissionSortBy>("permission");
  const [sortDir, setSortDir] = useState<PermissionSortDir>("ASC");
  const [draftOverrides, setDraftOverrides] = useState(() => toOverrideMap(user));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedOverrides = useMemo(() => toOverrideMap(user), [user]);
  const isDirty = !areOverrideMapsEqual(savedOverrides, draftOverrides);
  const canManagePermissions = getCanManagePermissions({
    actorId: actor?.id,
    canUpdateAny,
    canUpdateNonAdmin,
    user,
  });
  const rows = useMemo(
    () =>
      createPermissionRows({
        overrides: draftOverrides,
        role: user.role,
        search,
        sortBy,
        sortDir,
      }),
    [draftOverrides, search, sortBy, sortDir, user.role],
  );

  useEffect(() => {
    setDraftOverrides(toOverrideMap(user));
  }, [user]);

  const toggleSort = useCallback(
    (nextSortBy: PermissionSortBy) => {
      if (sortBy === nextSortBy) {
        setSortDir((current) => (current === "ASC" ? "DESC" : "ASC"));
        return;
      }

      setSortBy(nextSortBy);
      setSortDir("ASC");
    },
    [sortBy],
  );

  const setPermissionOverride = useCallback(
    (permission: Permission, value: OverrideValue) => {
      setDraftOverrides((current) => ({
        ...current,
        [permission]: value,
      }));
    },
    [],
  );

  async function savePermissions() {
    setSaving(true);

    try {
      await updateUserPermissions(user.id, {
        permission_overrides: toPermissionOverrides(draftOverrides),
      });
      setConfirmOpen(false);
      toast.success(t("users.detail.permissions.saveSuccess"));
      await router.invalidate();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("users.detail.permissions.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 px-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-normal">
            {t("users.detail.permissions.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("users.detail.permissions.description")}
          </p>
        </div>

        {canManagePermissions ? (
          <PermissionsEditorActions
            disabled={!isDirty}
            saving={saving}
            onReset={() => setDraftOverrides(savedOverrides)}
            onSave={() => setConfirmOpen(true)}
          />
        ) : null}
      </div>

      <div className="max-w-lg space-y-1.5">
        <Label htmlFor="user-permissions-search">
          {t("users.detail.permissions.search")}
        </Label>
        <Input
          id="user-permissions-search"
          type="search"
          value={search}
          placeholder={t("users.detail.permissions.searchPlaceholder")}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <PermissionsTable
        canManagePermissions={canManagePermissions}
        rows={rows}
        saving={saving}
        sortBy={sortBy}
        sortDir={sortDir}
        onOverrideChange={setPermissionOverride}
        onSort={toggleSort}
      />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("users.detail.permissions.noResults")}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={t("users.detail.permissions.confirmTitle")}
        description={t("users.detail.permissions.confirmDescription").replace(
          "{name}",
          user.display_name,
        )}
        confirmLabel={t("users.detail.permissions.confirm")}
        cancelLabel={t("common.actions.cancel")}
        loading={saving}
        onConfirm={() => {
          savePermissions().catch((error: unknown) => {
            toast.error(
              error instanceof Error
                ? error.message
                : t("users.detail.permissions.saveError"),
            );
          });
        }}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}

export { UserPermissionsEditor };
