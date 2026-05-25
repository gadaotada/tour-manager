import {
  DEFAULT_LOCALE,
  normalizeLocale,
  type Locale,
} from "@tour-manager/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const LOCALE_STORAGE_KEY = "tour-manager.ui.locale";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: normalizeLocale(globalThis.navigator?.language) ?? DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale: normalizeLocale(locale) }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (state) => ({ locale: state.locale }),
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);

          if (!raw) {
            return null;
          }

          try {
            return JSON.parse(raw) as {
              state: Pick<LocaleState, "locale">;
              version: number;
            };
          } catch {
            return {
              state: { locale: normalizeLocale(raw) },
              version: 0,
            };
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);

export { LOCALE_STORAGE_KEY, useLocaleStore };
