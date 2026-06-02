import { XIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { cn } from "@libs/utils";

import { useToastsStore } from "./toasts";

function Toaster() {
  const toasts = useToastsStore((state) => state.toasts);
  const dismiss = useToastsStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg",
            toast.kind === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
            toast.kind === "success" && "border-success/30 bg-success/10 text-success",
          )}
        >
          <p className="min-w-0 flex-1 text-sm/relaxed">{toast.message}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 shrink-0"
            onClick={() => dismiss(toast.id)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export { Toaster };
