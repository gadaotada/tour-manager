import type { MessageKey } from "@libs/i18n";
import type { LucideIcon } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Button } from "@components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { t } from "@libs/i18n";
import { cn } from "@libs/utils";

type SidebarButtonProps = {
  className?: string;
  icon: LucideIcon;
  isExpanded: boolean;
  labelKey: MessageKey;
  onClick?: () => void;
  showLabel?: boolean;
  to?: string;
  variant?: "default" | "ghost" | "outline";
};

type SidebarButtonContentProps = {
  Icon: LucideIcon;
  isExpanded: boolean;
  label: string;
  showLabel: boolean;
};

function SidebarButton({
  className,
  icon: Icon,
  isExpanded,
  labelKey,
  onClick,
  showLabel = true,
  to,
  variant = "ghost",
}: SidebarButtonProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isActive = isSidebarPathActive(pathname, to);
  const isIconOnly = isExpanded && !showLabel;
  const label = t(labelKey);
  const buttonClassName = getSidebarButtonClassName({
    className,
    isActive,
    isExpanded,
    isIconOnly,
    variant,
  });
  const size = isExpanded && !isIconOnly ? "lg" : "icon-lg";
  const content = (
    <SidebarButtonContent
      Icon={Icon}
      isExpanded={isExpanded}
      label={label}
      showLabel={showLabel}
    />
  );

  const button = to ? (
    <Button
      asChild
      className={buttonClassName}
      size={size}
      variant={variant}
    >
      <Link aria-label={label} onClick={onClick} to={to}>
        {content}
      </Link>
    </Button>
  ) : (
    <Button
      aria-label={label}
      className={buttonClassName}
      onClick={onClick}
      size={size}
      variant={variant}
    >
      {content}
    </Button>
  );

  return (
    <div className={cn("p-0.5", isIconOnly && "w-fit shrink-0")}>
      {isExpanded || !to ? (
        button
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function SidebarButtonContent({
  Icon,
  isExpanded,
  label,
  showLabel,
}: SidebarButtonContentProps) {
  return (
    <>
      <Icon className="size-4 shrink-0 lg:size-4.5" />
      {isExpanded && showLabel ? (
        <span className="truncate">{label}</span>
      ) : null}
    </>
  );
}

function getSidebarButtonClassName({
  className,
  isActive,
  isExpanded,
  isIconOnly,
  variant,
}: {
  className?: string;
  isActive: boolean;
  isExpanded: boolean;
  isIconOnly: boolean;
  variant: NonNullable<SidebarButtonProps["variant"]>;
}) {
  const hasMutedHover = variant === "ghost" || variant === "outline";

  return cn(
    isExpanded && !isIconOnly && "h-9 min-w-0 w-full justify-start gap-2 px-2.5 lg:h-10 lg:text-base",
    (!isExpanded || isIconOnly) && "size-9 shrink-0 justify-center lg:size-10",
    hasMutedHover &&
      "hover:bg-surface-muted hover:text-foreground dark:hover:bg-surface-muted/80",
    isActive &&
      "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    className,
  );
}

function isSidebarPathActive(pathname: string, to?: string): boolean {
  return to ? pathname === to || pathname.startsWith(`${to}/`) : false;
}

export { SidebarButton };
