import type { z } from "zod";

import { ApiClientError } from "@libs/api";
import type { MessageKey } from "@libs/i18n";

type FieldErrors<TField extends string> = Partial<Record<TField | "root", string>>;

function createTranslatedFieldErrors<TField extends string>(
  issues: z.ZodIssue[],
  fields: readonly TField[],
  t: (key: MessageKey) => string,
): FieldErrors<TField> {
  const fieldSet = new Set<string>(fields);
  const errors: FieldErrors<TField> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string" || !fieldSet.has(field)) continue;

    const typedField = field as TField;
    if (errors[typedField]) continue;

    errors[typedField] = t(issue.message as MessageKey);
  }

  return errors;
}

function getSubmitErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export {
  createTranslatedFieldErrors,
  getSubmitErrorMessage,
  type FieldErrors,
};
