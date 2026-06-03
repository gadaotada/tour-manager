import type { UserDetail } from "@tour-manager/shared";

import { ActiveStateBadge, DetailItem } from "@components/data";
import { Button } from "@components/ui/button";
import { useLocaleStore, useT } from "@libs/i18n";
import { APP_PATHS } from "@libs/routes/app-paths";
import { formatDateTime } from "@libs/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { UserPermissionsEditor } from "./components/permissions-editor";
import { DEFAULT_USERS_QUERY } from "./users.query";

type UserDetailPageProps = {
  user: UserDetail;
};

function UserDetailPage({ user }: UserDetailPageProps) {
  const t = useT();
  const locale = useLocaleStore((state) => state.locale);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 rounded-lg border bg-surface p-2">
      <section className="shrink-0 space-y-5 border-b pb-5">
        <div className="flex flex-col gap-4 px-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link to={APP_PATHS.users} search={DEFAULT_USERS_QUERY}>
                <ArrowLeftIcon className="size-4" />
                {t("users.detail.back")}
              </Link>
            </Button>
            <div className="space-y-1">
              <h1 className="truncate text-2xl font-semibold tracking-normal">
                {user.display_name}
              </h1>
              <p className="text-sm text-muted-foreground">{user.username}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border px-2 py-1 text-sm font-medium">
              {t(`users.roles.${user.role}`)}
            </span>
            <ActiveStateBadge
              activeLabel={t("users.filters.enabled")}
              inactiveLabel={t("users.filters.disabled")}
              isActive={user.is_enabled}
            />
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label={t("users.columns.username")} value={user.username} />
          <DetailItem
            label={t("users.columns.display_name")}
            value={user.display_name}
          />
          <DetailItem
            label={t("users.columns.created_at")}
            value={formatDateTime(user.created_at, locale)}
          />
          <DetailItem
            label={t("users.columns.updated_at")}
            value={formatDateTime(user.updated_at, locale)}
          />
        </dl>
      </section>

      <UserPermissionsEditor user={user} />
    </div>
  );
}

export { UserDetailPage };
