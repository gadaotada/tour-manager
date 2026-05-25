import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { LanguageMenu, ThemeMenu } from "@components/preferences";
import { Button } from "@components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { t, useLocaleStore } from "@libs/i18n";
import { cn } from "@libs/utils";

type AppHeaderProps = {
  isSidebarExpanded: boolean;
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  subtitle?: string;
  title: string;
};

function AppHeader({
  isSidebarExpanded,
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
  subtitle,
  title,
}: AppHeaderProps) {
  const locale = useLocaleStore((state) => state.locale);

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
          <h1 className="truncate text-sm font-semibold tracking-normal lg:text-base">
            {title}
          </h1>
          <p className="truncate text-xs text-muted-foreground lg:text-sm">
            {subtitle ?? t("dashboard.header.overview")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
