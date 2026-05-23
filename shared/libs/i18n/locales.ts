const SUPPORTED_LOCALES = ["en", "bg"] as const;
const DEFAULT_LOCALE = "en";

type Locale = (typeof SUPPORTED_LOCALES)[number];

const isLocale = (value: string): value is Locale => {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
};

const normalizeLocale = (value: string | undefined): Locale => {
  if (!value) return DEFAULT_LOCALE;

  const normalized = value.trim().toLowerCase().split(",")[0]?.split("-")[0];
  return normalized && isLocale(normalized) ? normalized : DEFAULT_LOCALE;
};

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  isLocale,
  normalizeLocale,
};
