const UI_THEMES = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
} as const;

const THEME_STORAGE_KEY = "tour-manager.ui.theme";

type ValueOf<T> = T[keyof T];
type UiTheme = ValueOf<typeof UI_THEMES>;
type ResolvedUiTheme = Exclude<UiTheme, typeof UI_THEMES.SYSTEM>;

const DEFAULT_UI_THEME = UI_THEMES.SYSTEM;

function isUiTheme(value: unknown): value is UiTheme {
  return (
    typeof value === "string" &&
    Object.values(UI_THEMES).includes(value as UiTheme)
  );
}

function normalizeUiTheme(value: unknown): UiTheme {
  return isUiTheme(value) ? value : DEFAULT_UI_THEME;
}

function resolveUiTheme(theme: UiTheme): ResolvedUiTheme {
  if (theme === UI_THEMES.SYSTEM) {
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? UI_THEMES.DARK
      : UI_THEMES.LIGHT;
  }

  return theme;
}

function applyUiTheme(theme: UiTheme): void {
  const root = document.documentElement;
  const resolved = resolveUiTheme(theme);

  root.classList.remove("dark", "light");
  root.classList.add(resolved);
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export {
  applyUiTheme,
  DEFAULT_UI_THEME,
  normalizeUiTheme,
  resolveUiTheme,
  THEME_STORAGE_KEY,
  UI_THEMES,
  type ResolvedUiTheme,
  type UiTheme,
};
