import type { Request } from "express";
import { DEFAULT_LOCALE, HTTP_HEADERS, normalizeLocale, type Locale } from "@tour-manager/shared";

const resolveLocale = (req: Request): Locale => {
  const header = req.header(HTTP_HEADERS.APP_LANG);
  return typeof header === "string" ? normalizeLocale(header) : DEFAULT_LOCALE;
};

export { resolveLocale };
