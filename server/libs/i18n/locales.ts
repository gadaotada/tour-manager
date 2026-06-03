import type { Request } from "express";
import { HTTP_HEADERS, normalizeLocale, type Locale } from "@tour-manager/shared";

const resolveLocale = (req: Request): Locale => {
  const header = req.header(HTTP_HEADERS.APP_LANG);
  return normalizeLocale(header);
};

export { resolveLocale };
