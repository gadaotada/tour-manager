import type { MessageKey } from "@libs/i18n";
import type { LucideIcon } from "lucide-react";
import { Link, useMatchRoute } from "@tanstack/react-router";

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
  const matchRoute = useMatchRoute();
  const isActive = to ? Boolean(matchRoute({ to })) : false;
  const isIconOnly = isExpanded && !showLabel;
  const label = t(labelKey);
  const buttonClassName = cn(
    isExpanded && !isIconOnly && "h-9 min-w-0 w-full justify-start gap-2 px-2.5 lg:h-10 lg:text-base",
    (!isExpanded || isIconOnly) && "size-9 shrink-0 justify-center lg:size-10",
    variant === "ghost" &&
      "hover:bg-surface-muted hover:text-foreground dark:hover:bg-surface-muted/80",
    variant === "outline" &&
      "hover:bg-surface-muted hover:text-foreground dark:hover:bg-surface-muted/80",
    isActive &&
      "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    className,
  );

  const content = (
    <>
      <Icon className="size-4 shrink-0 lg:size-4.5" />
      {isExpanded && showLabel ? (
        <span className="truncate">{label}</span>
      ) : null}
    </>
  );

  const button = to ? (
    <Button
      asChild
      className={buttonClassName}
      size={isExpanded && !isIconOnly ? "lg" : "icon-lg"}
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
      size={isExpanded && !isIconOnly ? "lg" : "icon-lg"}
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

export { SidebarButton };
