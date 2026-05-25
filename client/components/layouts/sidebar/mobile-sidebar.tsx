import { LogOut, X } from "lucide-react";

import { t } from "@libs/i18n";
import { cn } from "@libs/utils";

import { SidebarBrand } from "./sidebar-brand";
import { SidebarButton } from "./sidebar-button";
import { SidebarNav } from "./sidebar-nav";
import { SidebarQuickActions } from "./sidebar-quick-actions";
import type { MobileSidebarProps } from "./types";

function MobileSidebar({
  isOpen,
  onClose,
  onLogout,
  userName,
}: MobileSidebarProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        aria-label={t("dashboard.sidebar.toggle")}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex h-dvh w-[min(320px,calc(100vw-32px))] flex-col border-r bg-surface px-4 shadow-xl transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 overflow-visible lg:h-18">
          <div className="min-w-0 flex-1">
            <SidebarBrand userName={userName} />
          </div>
          <SidebarButton
            icon={X}
            isExpanded
            labelKey="dashboard.sidebar.close"
            onClick={onClose}
            showLabel={false}
            variant="outline"
          />
        </div>

        <SidebarQuickActions isExpanded />
        <SidebarNav isExpanded />
        <div className="mt-auto shrink-0 pb-4">
          <SidebarButton
            icon={LogOut}
            isExpanded
            labelKey="dashboard.signOut"
            onClick={onLogout}
          />
        </div>
      </aside>
    </div>
  );
}

export { MobileSidebar };
