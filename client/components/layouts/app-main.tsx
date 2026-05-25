import type { ReactNode } from "react";

import { cn } from "@libs/utils";

type AppMainProps = {
  children: ReactNode;
  className?: string;
};

function AppMain({ children, className }: AppMainProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div
          className={cn(
            "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { AppMain };
