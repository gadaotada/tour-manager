import { LogOut } from "lucide-react";

import { cn } from "@libs/utils";

import { SidebarBrand } from "./sidebar-brand";
import { SidebarButton } from "./sidebar-button";
import { SidebarNav } from "./sidebar-nav";
import { SidebarQuickActions } from "./sidebar-quick-actions";
import type { DesktopSidebarProps } from "./types";

function DesktopSidebar({ isExpanded, onLogout, userName }: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-dvh min-h-0 min-w-0 border-r bg-surface lg:flex lg:flex-col",
        isExpanded ? "px-4" : "items-center px-2",
      )}
    >
      <SidebarBrand compact={!isExpanded} userName={userName} />

      <SidebarQuickActions isExpanded={isExpanded} />

      <SidebarNav isExpanded={isExpanded} />

      <div className={cn("mt-auto shrink-0 pb-4", !isExpanded && "flex w-full justify-center")}>
        <SidebarButton
          icon={LogOut}
          isExpanded={isExpanded}
          labelKey="dashboard.signOut"
          onClick={onLogout}
        />
      </div>
    </aside>
  );
}

export { DesktopSidebar };
