import type { ReactNode } from "react";

import { cn } from "@libs/utils";

const APP_SHELL_SIDEBAR_WIDTH = {
  collapsed: "4rem",
  expanded: "220px",
} as const;

type AppShellProps = {
  children: ReactNode;
  header: ReactNode;
  isSidebarExpanded: boolean;
  sidebar: ReactNode;
};

function AppShell({
  children,
  header,
  isSidebarExpanded,
  sidebar,
}: AppShellProps) {
  return (
    <main className="h-dvh overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "grid h-full min-h-0 transition-[grid-template-columns] duration-200",
          "grid-cols-[minmax(0,1fr)] lg:grid-cols-[var(--app-sidebar-width)_minmax(0,1fr)]",
        )}
        style={{
          ["--app-sidebar-width" as string]: isSidebarExpanded
            ? APP_SHELL_SIDEBAR_WIDTH.expanded
            : APP_SHELL_SIDEBAR_WIDTH.collapsed,
        }}
      >
        <div className="min-h-0 min-w-0">{sidebar}</div>

        <section className="flex h-dvh min-w-0 flex-col overflow-hidden bg-background">
          {header}
          {children}
        </section>
      </div>
    </main>
  );
}

export { APP_SHELL_SIDEBAR_WIDTH, AppShell };
