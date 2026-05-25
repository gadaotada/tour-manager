import { useLocaleStore } from "./locale-store";

function resolveRequestLocale() {
  return useLocaleStore.getState().locale;
}

export { resolveRequestLocale };
