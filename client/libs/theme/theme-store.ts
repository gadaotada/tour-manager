import { UI_THEMES, applyUiTheme, DEFAULT_UI_THEME, normalizeUiTheme, type UiTheme } from "./theme";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEME_STORAGE_KEY = "tour-manager.ui.theme";

type ThemeState = {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_UI_THEME,
      setTheme: (theme) => {
        const nextTheme = normalizeUiTheme(theme);

        applyUiTheme(nextTheme);
        set({ theme: nextTheme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);

          if (!raw) {
            return null;
          }

          try {
            return JSON.parse(raw) as { state: Pick<ThemeState, "theme">; version: number };
          } catch {
            return {
              state: { theme: normalizeUiTheme(raw) },
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyUiTheme(state.theme);
        }
      },
    },
  ),
);

function initThemeStore(): void {
  applyUiTheme(useThemeStore.getState().theme);

  useThemeStore.persist.onFinishHydration(() => {
    applyUiTheme(useThemeStore.getState().theme);
  });

  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (useThemeStore.getState().theme === UI_THEMES.SYSTEM) {
      applyUiTheme(UI_THEMES.SYSTEM);
    }
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);
}

export { initThemeStore, THEME_STORAGE_KEY, useThemeStore };
