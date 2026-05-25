import { Fragment, useState, type ReactNode } from "react";
import { useMatches, useNavigate } from "@tanstack/react-router";

import { AppHeader, AppMain, AppShell, AppSidebar } from "@components/layouts";
import { logout } from "@features/login";
import { useAuthUser } from "@core/stores";
import { t } from "@libs/i18n";

type AppPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

function AppPageLayout({ children, className = "" }: AppPageLayoutProps) {
  const navigate = useNavigate();
  const user = useAuthUser();
  const title = useAppPageTitle();
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
          title={title}
        />
      }
      sidebar={
        <Fragment>
          <AppSidebar
            isExpanded={isDesktopSidebarExpanded}
            onLogout={handleLogout}
            userName={user?.displayName}
            variant="desktop"
          />

          <AppSidebar
            isOpen={isMobileSidebarOpen}
            onClose={handleCloseMobileSidebar}
            onLogout={handleLogout}
            userName={user?.displayName}
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

export { AppPageLayout, useAppPageTitle };
