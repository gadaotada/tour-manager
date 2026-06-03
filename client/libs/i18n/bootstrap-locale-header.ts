import { HTTP_HEADERS, type Locale } from "@tour-manager/shared";

import { setHttpClientDefaultHeader } from "@libs/api";

import { useLocaleStore } from "./locale-store";

function syncRequestLocaleHeader(locale: Locale): void {
  setHttpClientDefaultHeader(HTTP_HEADERS.APP_LANG, locale);
}

function bootstrapLocaleHeaderSync(): void {
  syncRequestLocaleHeader(useLocaleStore.getState().locale);

  useLocaleStore.persist.onFinishHydration(() => {
    syncRequestLocaleHeader(useLocaleStore.getState().locale);
  });

  useLocaleStore.subscribe((state) => {
    syncRequestLocaleHeader(state.locale);
  });
}

export { bootstrapLocaleHeaderSync };
