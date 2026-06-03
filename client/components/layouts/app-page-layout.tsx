import { Fragment, useState, type ReactNode } from "react";
import { useMatches, useNavigate } from "@tanstack/react-router";

import { logout } from "@features/login";
import { useAuthUser } from "@core/stores";
import { t } from "@libs/i18n";

import { AppHeader } from "./app-header";
import { AppMain } from "./app-main";
import { AppShell } from "./app-shell";
import { AppSidebar } from "./sidebar";
import { usePagePresence } from "./use-page-presence";

type AppPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

function AppPageLayout({ children, className = "" }: AppPageLayoutProps) {
  const navigate = useNavigate();
  const user = useAuthUser();
  const title = useAppPageTitle();
  const presence = usePagePresence();
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    await navigate({ to: "/" });
  }

  function handleOpenMobileSidebar() {
    setIsMobileSidebarOpen(true);
  }

  function handleCloseMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  function handleToggleDesktopSidebar() {
    setIsDesktopSidebarExpanded((value) => !value);
  }

  return (
    <AppShell
      isSidebarExpanded={isDesktopSidebarExpanded}
      header={
        <AppHeader
          isSidebarExpanded={isDesktopSidebarExpanded}
          onOpenMobileSidebar={handleOpenMobileSidebar}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          presence={presence}
          title={title}
        />
      }
      sidebar={
        <Fragment>
          <AppSidebar
            isExpanded={isDesktopSidebarExpanded}
            onLogout={handleLogout}
            userName={user?.display_name}
            variant="desktop"
          />

          <AppSidebar
            isOpen={isMobileSidebarOpen}
            onClose={handleCloseMobileSidebar}
            onLogout={handleLogout}
            userName={user?.display_name}
            variant="mobile"
          />
        </Fragment>
      }
    >
      <AppMain className={className}>{children}</AppMain>
    </AppShell>
  );
}

function useAppPageTitle(): string {
  const matches = useMatches();

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const titleKey = matches[index]?.staticData?.titleKey;

    if (titleKey) {
      return t(titleKey);
    }
  }

  return t("dashboard.title");
}

export { AppPageLayout };
