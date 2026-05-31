import type { Locale } from "./locales";

const commonMessages = {
    en: {},
    bg: {},
} as const satisfies Record<Locale, Record<string, string>>;

export { commonMessages };
