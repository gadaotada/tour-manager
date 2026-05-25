import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@components/ui/dropdown-menu";
import { t } from "@libs/i18n";
import { UI_THEMES, useThemeStore, type UiTheme } from "@libs/theme";

import { PreferenceMenuTrigger } from "./preference-menu-trigger";

const THEME_OPTIONS: Array<{
  icon: LucideIcon;
  labelKey: "preferences.theme.light" | "preferences.theme.dark" | "preferences.theme.system";
  value: UiTheme;
}> = [
  { value: UI_THEMES.LIGHT, labelKey: "preferences.theme.light", icon: Sun },
  { value: UI_THEMES.DARK, labelKey: "preferences.theme.dark", icon: Moon },
  { value: UI_THEMES.SYSTEM, labelKey: "preferences.theme.system", icon: Monitor },
];

function ThemeMenu() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const TriggerIcon =
    THEME_OPTIONS.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <PreferenceMenuTrigger label={t("preferences.theme.label")}>
        <TriggerIcon className="size-4 lg:size-4.5" />
      </PreferenceMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("preferences.theme.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) => setTheme(value as UiTheme)}
          value={theme}
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="size-3.5" />
                {t(option.labelKey)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeMenu };
