import { ApiClientError } from "@libs/api";
import type { MessageKey } from "@libs/i18n";

type FieldErrors<TField extends string> = Partial<Record<TField | "root", string>>;
type Translate = (key: MessageKey) => string;
type ApiValidationDetails = {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

function createApiFieldErrors<TField extends string>(
  error: unknown,
  fields: readonly TField[],
  t: Translate,
): FieldErrors<TField> {
  if (!(error instanceof ApiClientError) || !isApiValidationDetails(error.payload.details)) {
    return {};
  }

  const errors: FieldErrors<TField> = {};

  for (const field of fields) {
    const message = error.payload.details.fieldErrors?.[field]?.[0];
    if (!message) continue;

    errors[field] = translateMessage(message, t);
  }

  const rootMessage = error.payload.details.formErrors?.[0];
  if (rootMessage) {
    errors.root = translateMessage(rootMessage, t);
  }

  return errors;
}

function getSubmitErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function getTranslatedFormError(errors: readonly unknown[], t: Translate): string | null {
  const firstError = errors.find((error) => error !== undefined && error !== null);
  if (!firstError) return null;

  if (typeof firstError === "string") {
    return translateMessage(firstError, t);
  }

  if (isStandardSchemaIssue(firstError)) {
    return translateMessage(firstError.message, t);
  }

  return null;
}

function translateMessage(message: string, t: Translate): string {
  return t(message as MessageKey);
}

function isApiValidationDetails(value: unknown): value is ApiValidationDetails {
  if (!value || typeof value !== "object") return false;

  return "fieldErrors" in value || "formErrors" in value;
}

function isStandardSchemaIssue(value: unknown): value is { message: string } {
  return (
    !!value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

export {
  createApiFieldErrors,
  getSubmitErrorMessage,
  getTranslatedFormError,
  type FieldErrors,
};
