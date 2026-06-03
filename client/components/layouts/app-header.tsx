import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Users,
} from "lucide-react";

import { LanguageMenu, ThemeMenu } from "@components/preferences";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { t } from "@libs/i18n";
import { cn } from "@libs/utils";

import type { PagePresence } from "./use-page-presence";

type AppHeaderProps = {
  isSidebarExpanded: boolean;
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  presence: PagePresence;
  subtitle?: string;
  title: string;
};

function AppHeader({
  isSidebarExpanded,
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
  presence,
  subtitle,
  title,
}: AppHeaderProps) {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6 lg:h-18 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <HeaderIconButton
          className="lg:hidden"
          label={t("dashboard.sidebar.toggle")}
          onClick={onOpenMobileSidebar}
        >
          <Menu className="size-4 lg:size-4.5" />
        </HeaderIconButton>

        <HeaderIconButton
          className="hidden lg:inline-flex"
          label={t("dashboard.sidebar.toggle")}
          onClick={onToggleDesktopSidebar}
        >
          {isSidebarExpanded ? (
            <PanelLeftClose className="size-4 lg:size-4.5" />
          ) : (
            <PanelLeftOpen className="size-4 lg:size-4.5" />
          )}
        </HeaderIconButton>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-normal lg:text-lg">
            {title}
          </h1>
          <p className="truncate text-base text-muted-foreground">
            {subtitle ?? t("dashboard.header.overview")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PagePresenceMenu presence={presence} />
        <LanguageMenu />
        <ThemeMenu />
        <HeaderIconButton label={t("dashboard.header.search")}>
          <Search className="size-4 lg:size-4.5" />
        </HeaderIconButton>
        <HeaderIconButton label={t("dashboard.header.notifications")}>
          <Bell className="size-4 lg:size-4.5" />
        </HeaderIconButton>
      </div>
    </header>
  );
}

type PagePresenceMenuProps = {
  presence: PagePresence;
};

function PagePresenceMenu({ presence }: PagePresenceMenuProps) {
  const visibleCount = presence.active_users ?? 0;
  const visibleUsers = presence.users.slice(0, 3);
  const label =
    visibleCount === 1
      ? t("dashboard.header.presence.one")
      : t("dashboard.header.presence.many").replace("{count}", String(visibleCount));

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={label}
              className="gap-2 px-2.5 lg:h-9"
              size="sm"
              variant="outline"
            >
              <Users className="size-4 lg:size-4.5" />
              <span className="tabular-nums">{visibleCount}</span>
              {visibleUsers.length > 0 ? (
                <span className="hidden items-center gap-1 md:flex">
                  {visibleUsers.map((user) => (
                    <span
                      className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                      key={user.id}
                      title={user.display_name}
                    >
                      {getInitials(user.display_name)}
                    </span>
                  ))}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t("dashboard.header.presence.title")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {presence.users.length === 0 ? (
          <div className="px-2.5 py-2 text-base text-muted-foreground">
            {t("dashboard.header.presence.empty")}
          </div>
        ) : (
          <div className="space-y-1">
            {presence.users.map((user) => (
              <div
                className="flex min-h-10 items-center gap-2 rounded-md px-2.5 py-1.5"
                key={user.id}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(user.display_name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-medium">
                    {user.display_name}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    @{user.username}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type HeaderIconButtonProps = {
  children: React.ReactNode;
  className?: string;
  label: string;
  onClick?: () => void;
};

function HeaderIconButton({
  children,
  className,
  label,
  onClick,
}: HeaderIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn(
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:size-9",
            className,
          )}
          onClick={onClick}
          size="icon"
          variant="outline"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { AppHeader };
