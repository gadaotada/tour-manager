import { useMemo } from "react";

import { type MessageKey, translate } from "./messages";
import { useLocaleStore } from "./locale-store";

function getClientLocale() {
    return useLocaleStore.getState().locale;
}

function t(key: MessageKey): string {
    return translate(getClientLocale(), key);
}

function useT() {
    const locale = useLocaleStore((state) => state.locale);

    return useMemo(
        () => (key: MessageKey) => translate(locale, key),
        [locale],
    );
}

export { t, useT };
