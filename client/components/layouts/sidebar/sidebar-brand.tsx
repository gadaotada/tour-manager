import { Building2 } from "lucide-react";

import { t } from "@libs/i18n";
import { cn } from "@libs/utils";

type SidebarBrandProps = {
  compact?: boolean;
  userName: string | undefined;
};

function SidebarBrand({ compact = false, userName }: SidebarBrandProps) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center lg:h-18 px-2",
        compact ? "justify-center" : "gap-2",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-surface-raised lg:size-10">
        <Building2 className="size-4 lg:size-4.5" />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold lg:text-base">
            {t("login.brand")}
          </p>
          <p className="truncate text-xs text-muted-foreground lg:text-sm">
            {userName}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export { SidebarBrand };
