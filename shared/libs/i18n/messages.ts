import type { Locale } from "./locales";

const messages = {
  en: {
    "errors.internal": "Unexpected server error.",
    "errors.validation": "Invalid request data.",
    "errors.db.duplicateEntry": "A record with this value already exists.",
    "errors.db.notFound": "Record was not found.",
    "errors.db.versionMismatch": "This record was changed by another operation. Refresh and try again.",
    "errors.db.transient": "Temporary database conflict. Please try again.",
    "errors.db.general": "Database operation failed.",
  },
  bg: {
    "errors.internal": "Възникна неочаквана сървърна грешка.",
    "errors.validation": "Невалидни данни в заявката.",
    "errors.db.duplicateEntry": "Вече съществува запис с тази стойност.",
    "errors.db.notFound": "Записът не беше намерен.",
    "errors.db.versionMismatch": "Записът е променен от друга операция. Обновете и опитайте отново.",
    "errors.db.transient": "Временен конфликт с базата данни. Опитайте отново.",
    "errors.db.general": "Грешка при операция с базата данни.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

type MessageKey = keyof (typeof messages)["en"];

export { messages, type MessageKey };
