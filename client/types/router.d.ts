import type { MessageKey } from "@tour-manager/shared";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    titleKey?: MessageKey;
  }
}

export {};
