import type { ReactNode } from "react";

import { Button } from "@components/ui/button";
import { DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { cn } from "@libs/utils";

type PreferenceMenuTriggerProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

function PreferenceMenuTrigger({
  children,
  className,
  label,
}: PreferenceMenuTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        aria-label={label}
        className={cn(
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:size-9",
          className,
        )}
        size="icon"
        variant="outline"
      >
        {children}
      </Button>
    </DropdownMenuTrigger>
  );
}

export { PreferenceMenuTrigger };
