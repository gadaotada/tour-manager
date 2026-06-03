import { t, type MessageKey } from "@libs/i18n";
import { cn } from "@libs/utils";
import { useAuthUser } from "@core/stores";
import { hasPermission, type Permission } from "@tour-manager/shared";

import { mainNavItems, operationsNavItems } from "./nav-items";
import { SidebarButton } from "./sidebar-button";
import type { NavItem } from "./types";

type SidebarNavProps = {
  isExpanded: boolean;
};

function SidebarNav({ isExpanded }: SidebarNavProps) {
  const user = useAuthUser();

  return (
    <nav
      className={cn(
        "mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto pb-4",
        isExpanded ? "gap-8" : "items-center gap-4",
      )}
    >
      <SidebarGroup
        isExpanded={isExpanded}
        items={filterNavItems(mainNavItems, user?.permissions)}
        labelKey="dashboard.sidebar.main"
      />
      <SidebarGroup
        isExpanded={isExpanded}
        items={filterNavItems(operationsNavItems, user?.permissions)}
        labelKey="dashboard.sidebar.operations"
      />
    </nav>
  );
}

function filterNavItems(
  items: NavItem[],
  permissions: readonly Permission[] | undefined,
): NavItem[] {
  return items.filter((item) => !item.permission || hasPermission(permissions, item.permission));
}

type SidebarGroupProps = {
  isExpanded: boolean;
  items: NavItem[];
  labelKey: MessageKey;
};

function SidebarGroup({ isExpanded, items, labelKey }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-2 px-2", !isExpanded && "w-full")}>
      {isExpanded ? (
        <p className="px-2 text-base font-medium text-muted-foreground">
          {t(labelKey)}
        </p>
      ) : null}
      <div className={cn("space-y-0.5", !isExpanded && "flex w-full flex-col items-center")}>
        {items.map((item) => (
          <SidebarButton
            icon={item.icon}
            isExpanded={isExpanded}
            key={item.labelKey}
            labelKey={item.labelKey}
            to={item.to}
          />
        ))}
      </div>
    </div>
  );
}

export { SidebarNav };
