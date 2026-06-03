import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { cn } from "@libs/utils";

type SortableColumnHeaderProps = {
  active: boolean;
  dir: "ASC" | "DESC";
  label: string;
  onClick: () => void;
};

function SortableColumnHeader({
  active,
  dir,
  label,
  onClick,
}: SortableColumnHeaderProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        active && "text-foreground",
      )}
      onClick={onClick}
    >
      {label}
      {active ? (
        dir === "DESC" ? (
          <ArrowDownIcon className="size-3.5 shrink-0 opacity-70" />
        ) : (
          <ArrowUpIcon className="size-3.5 shrink-0 opacity-70" />
        )
      ) : null}
    </button>
  );
}

export { SortableColumnHeader };
