import { Inbox, Plus } from "lucide-react";

import { cn } from "@libs/utils";

import { SidebarButton } from "./sidebar-button";

type SidebarQuickActionsProps = {
  isExpanded: boolean;
};

function SidebarQuickActions({ isExpanded }: SidebarQuickActionsProps) {
  return (
    <div
      className={cn(
        "mt-2 flex w-full min-w-0 shrink-0 flex-col gap-2 px-1",
        !isExpanded && "items-center",
      )}
    >
      <SidebarButton
        icon={Plus}
        isExpanded={isExpanded}
        labelKey="dashboard.sidebar.quickCreate"
        variant="default"
      />
      <SidebarButton
        icon={Inbox}
        isExpanded={isExpanded}
        labelKey="dashboard.sidebar.inbox"
        variant="outline"
      />
    </div>
  );
}

export { SidebarQuickActions };
