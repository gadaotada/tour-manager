import { PlusIcon, RotateCcwIcon } from "lucide-react";

import { ROLES } from "@tour-manager/shared";

import { SearchInput } from "@components/data";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useT } from "@libs/i18n";

import { useUserPermissions } from "../use-user-permissions";
import type { UsersListFilters } from "../users.query";

type UsersToolbarProps = {
  canCreate: boolean;
  filters: UsersListFilters;
  onCreate: () => void;
  onIsEnabledChange: (value: UsersListFilters["is_enabled"]) => void;
  onReset: () => void;
  onRoleChange: (value: UsersListFilters["role"]) => void;
  onSearchChange: (value: string) => void;
};

function UsersToolbar({
  canCreate,
  filters,
  onCreate,
  onIsEnabledChange,
  onReset,
  onRoleChange,
  onSearchChange,
}: UsersToolbarProps) {
  const t = useT();
  const { canReadAdminUsers, canReadNonAdmin } = useUserPermissions();
  const roleOptions: Array<{ label: string; value: UsersListFilters["role"] }> = [
    { value: "all", label: t("users.filters.allRoles") },
    ...(canReadAdminUsers ? [{ value: ROLES.ADMIN, label: t("users.roles.ADMIN") }] : []),
    ...(canReadAdminUsers || canReadNonAdmin
      ? [{ value: ROLES.MODERATOR, label: t("users.roles.MODERATOR") }]
      : []),
    ...(canReadAdminUsers || canReadNonAdmin
      ? [{ value: ROLES.EMPLOYEE, label: t("users.roles.EMPLOYEE") }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
          <Label htmlFor="users-search">{t("users.filters.search")}</Label>
          <SearchInput
            id="users-search"
            value={filters.search}
            placeholder={t("users.filters.searchPlaceholder")}
            onSearchChange={onSearchChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("users.columns.role")}</Label>
          <Select value={filters.role} onValueChange={(value) => onRoleChange(value as UsersListFilters["role"])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t("users.columns.is_enabled")}</Label>
          <Select
            value={filters.is_enabled}
            onValueChange={(value) => onIsEnabledChange(value as UsersListFilters["is_enabled"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("users.filters.allStatuses")}</SelectItem>
              <SelectItem value="enabled">{t("users.filters.enabled")}</SelectItem>
              <SelectItem value="disabled">{t("users.filters.disabled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcwIcon className="size-4" />
          {t("users.filters.reset")}
        </Button>

        {canCreate ? (
          <Button type="button" onClick={onCreate}>
            <PlusIcon className="size-4" />
            {t("users.actions.create")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { UsersToolbar };
