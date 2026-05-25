import { useMemo } from "react";
import {
  translate,
  type Locale,
  type MessageKey,
} from "@tour-manager/shared";

import { useLocaleStore } from "./locale-store";

function getClientLocale(): Locale {
  return useLocaleStore.getState().locale;
}

function t(key: MessageKey): string {
  return translate(getClientLocale(), key);
}

function useT() {
  const locale = useLocaleStore((state) => state.locale);

  return useMemo(
    () => (key: MessageKey) => translate(locale, key),
    [locale],
  );
}

export { getClientLocale, t, useT };
