import {
    commonMessages,
    createTranslator,
    type Locale,
} from "@tour-manager/shared";

const serverOwnMessages = {
    en: {
        "errors.internal": "Unexpected server error.",
        "errors.validation": "Invalid request data.",
        "errors.db.duplicateEntry": "A record with this value already exists.",
        "errors.db.notFound": "Record was not found.",
        "errors.db.versionMismatch": "This record was changed by another operation. Refresh and try again.",
        "errors.db.transient": "Temporary database conflict. Please try again.",
        "errors.db.general": "Database operation failed.",
        "errors.auth.invalidCredentials": "Invalid username or password.",
        "errors.auth.disabledUser": "This user account is disabled.",
        "errors.auth.unauthenticated": "You must be signed in.",
        "errors.auth.forbidden": "You do not have permission to perform this action.",
        "errors.clientVersionMismatch": "A new version is available. Refreshing the app.",
        "errors.notFound": "The requested resource was not found.",
        "errors.methodNotAllowed": "This method is not allowed for this resource.",
    },
    bg: {
        "errors.internal": "Възникна неочаквана сървърна грешка.",
        "errors.validation": "Невалидни данни в заявката.",
        "errors.db.duplicateEntry": "Вече съществува запис с тази стойност.",
        "errors.db.notFound": "Записът не беше намерен.",
        "errors.db.versionMismatch": "Записът е променен от друга операция. Обновете и опитайте отново.",
        "errors.db.transient": "Временен конфликт с базата данни. Опитайте отново.",
        "errors.db.general": "Грешка при операция с базата данни.",
        "errors.auth.invalidCredentials": "Невалидно потребителско име или парола.",
        "errors.auth.disabledUser": "Този потребителски профил е деактивиран.",
        "errors.auth.unauthenticated": "Трябва да влезете в профила си.",
        "errors.auth.forbidden": "Нямате права за това действие.",
        "errors.clientVersionMismatch": "Налична е нова версия. Приложението се обновява.",
        "errors.notFound": "Ресурсът, който сте заявили, не беше намерен",
        "errors.methodNotAllowed": "Този метод не е позволен за този ресурс.",
    },
} as const satisfies Record<Locale, Record<string, string>>;

const serverMessages = {
    en: { ...commonMessages.en, ...serverOwnMessages.en },
    bg: { ...commonMessages.bg, ...serverOwnMessages.bg },
} as const satisfies Record<Locale, Record<string, string>>;

type MessageKey =
    | keyof (typeof serverOwnMessages)["en"]
    | keyof (typeof commonMessages)["en"];

const translate = createTranslator(serverMessages);

export { type MessageKey, translate };
