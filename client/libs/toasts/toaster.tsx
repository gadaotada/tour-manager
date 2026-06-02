import { CheckCircle2Icon, CircleAlertIcon, XIcon } from "lucide-react";

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
    <div className="fixed top-4 right-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-md border bg-popover px-3 py-2.5 text-sm text-popover-foreground shadow-lg",
            toast.kind === "error" && "border-destructive/25",
            toast.kind === "success" && "border-success/25",
          )}
          role={toast.kind === "error" ? "alert" : "status"}
        >
          {toast.kind === "error" ? (
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
          )}
          <p className="min-w-0 flex-1 text-sm/relaxed text-foreground">{toast.message}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mt-1 -mr-1 size-7 shrink-0 text-muted-foreground hover:text-foreground"
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
