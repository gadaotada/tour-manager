import type { Request } from "express";
import { normalizeLocale, type Locale } from "@tour-manager/shared";

const APP_LANG_HEADER = "app-lang";

const resolveLocale = (req: Request): Locale => {
  const header = req.header(APP_LANG_HEADER);
  return normalizeLocale(header);
};

export {
  APP_LANG_HEADER,
  resolveLocale,
};
