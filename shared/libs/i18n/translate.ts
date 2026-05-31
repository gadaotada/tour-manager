import { DEFAULT_LOCALE, type Locale } from "./locales";

type MessageCatalog = Record<Locale, Record<string, string>>;

type MessageKeyOf<M extends MessageCatalog> = keyof M[Locale] & string;

const translate = <M extends MessageCatalog>(
    messages: M,
    locale: Locale,
    key: MessageKeyOf<M>,
): string => {
    return messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
};

const createTranslator = <M extends MessageCatalog>(messages: M) => {
    type Key = MessageKeyOf<M>;

    return (locale: Locale, key: Key): string => translate(messages, locale, key);
};

export { createTranslator, translate, type MessageKeyOf };
