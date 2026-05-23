import { DEFAULT_LOCALE, type Locale } from "./locales";
import { messages, type MessageKey } from "./messages";

const translate = (locale: Locale, key: MessageKey): string => {
  return messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
};

export { translate };
