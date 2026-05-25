import { Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@components/ui/dropdown-menu";
import { t, useLocaleStore } from "@libs/i18n";
import type { Locale } from "@tour-manager/shared";

import { PreferenceMenuTrigger } from "./preference-menu-trigger";

const LOCALE_OPTIONS = [
  { locale: "en" as const, labelKey: "preferences.language.en" as const },
  { locale: "bg" as const, labelKey: "preferences.language.bg" as const },
];

function LanguageMenu() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <DropdownMenu>
      <PreferenceMenuTrigger label={t("preferences.language.label")}>
        <Languages className="size-4 lg:size-4.5" />
      </PreferenceMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("preferences.language.label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value) => setLocale(value as Locale)}
          value={locale}
        >
          {LOCALE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.locale} value={option.locale}>
              {t(option.labelKey)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LanguageMenu };
