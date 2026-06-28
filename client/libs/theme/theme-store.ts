import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  UI_THEMES,
  applyUiTheme,
  DEFAULT_UI_THEME,
  normalizeUiTheme,
  resolveUiTheme,
  THEME_STORAGE_KEY,
  type ResolvedUiTheme,
  type UiTheme,
} from "./theme";

type ThemeState = {
  theme: UiTheme;
  resolvedTheme: ResolvedUiTheme;
  setTheme: (theme: UiTheme) => void;
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_UI_THEME,
      resolvedTheme: resolveUiTheme(DEFAULT_UI_THEME),
      setTheme: (theme) => {
        const nextTheme = normalizeUiTheme(theme);

        applyUiTheme(nextTheme);
        set({
          theme: nextTheme,
          resolvedTheme: resolveUiTheme(nextTheme),
        });
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
          useThemeStore.setState({
            resolvedTheme: resolveUiTheme(state.theme),
          });
        }
      },
    },
  ),
);

function initThemeStore(): void {
  const theme = useThemeStore.getState().theme;

  applyUiTheme(theme);
  useThemeStore.setState({ resolvedTheme: resolveUiTheme(theme) });

  useThemeStore.persist.onFinishHydration(() => {
    const hydratedTheme = useThemeStore.getState().theme;

    applyUiTheme(hydratedTheme);
    useThemeStore.setState({ resolvedTheme: resolveUiTheme(hydratedTheme) });
  });

  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (useThemeStore.getState().theme === UI_THEMES.SYSTEM) {
      applyUiTheme(UI_THEMES.SYSTEM);
      useThemeStore.setState({
        resolvedTheme: resolveUiTheme(UI_THEMES.SYSTEM),
      });
    }
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);
}

function useCurrentTheme(): ResolvedUiTheme {
  return useThemeStore((state) => state.resolvedTheme);
}

function getCurrentTheme(): ResolvedUiTheme {
  return useThemeStore.getState().resolvedTheme;
}

export { initThemeStore, useThemeStore, useCurrentTheme, getCurrentTheme };
