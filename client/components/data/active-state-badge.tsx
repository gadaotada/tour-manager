import { cn } from "@libs/utils";

type ActiveStateBadgeProps = {
  activeLabel: string;
  className?: string;
  inactiveLabel: string;
  isActive: boolean;
};

function ActiveStateBadge({
  activeLabel,
  className,
  inactiveLabel,
  isActive,
}: ActiveStateBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-sm font-medium",
        isActive
          ? "bg-success/15 text-success dark:bg-success/20 dark:text-success"
          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
        className,
      )}
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}

export { ActiveStateBadge, type ActiveStateBadgeProps };
