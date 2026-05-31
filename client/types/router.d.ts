import type { MessageKey } from "@libs/i18n";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    titleKey?: MessageKey;
  }
}

export {};
