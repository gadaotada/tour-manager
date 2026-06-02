import { getTranslatedFormError } from "./form-errors";

import { useT } from "@libs/i18n";

type FormFieldErrorProps = {
  className?: string;
  errors: readonly unknown[];
};

function FormFieldError({
  className = "text-sm text-destructive",
  errors,
}: FormFieldErrorProps) {
  const t = useT();
  const message = getTranslatedFormError(errors, t);

  return message ? <p className={className}>{message}</p> : null;
}

function hasFormErrors(errors: readonly unknown[]): boolean {
  return errors.some((error) => error !== undefined && error !== null);
}

function clearFieldServerError(field: { setErrorMap: (errorMap: never) => void }) {
  field.setErrorMap({ onServer: undefined } as never);
}

export { clearFieldServerError, FormFieldError, hasFormErrors };
