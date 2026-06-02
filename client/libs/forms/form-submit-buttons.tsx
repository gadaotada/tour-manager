import type { ReactNode } from "react";

import { Button } from "@components/ui/button";

type FormSubmitButtonsProps = {
  cancelLabel?: ReactNode;
  form: {
    Subscribe: <TSelected>(props: {
      children: (state: TSelected) => ReactNode;
      selector: (state: {
        canSubmit: boolean;
        isDirty: boolean;
        isSubmitting: boolean;
      }) => TSelected;
    }) => ReactNode | Promise<ReactNode>;
  };
  requireDirty?: boolean;
  submitClassName?: string;
  submitLabel: ReactNode;
  submittingLabel: ReactNode;
  onCancel?: () => void;
};

function FormSubmitButtons({
  cancelLabel,
  form,
  requireDirty = false,
  submitClassName,
  submitLabel,
  submittingLabel,
  onCancel,
}: FormSubmitButtonsProps) {
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty] as const}>
      {([canSubmit, isSubmitting, isDirty]) => (
        <>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="submit"
            className={submitClassName}
            disabled={!canSubmit || isSubmitting || (requireDirty && !isDirty)}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </>
      )}
    </form.Subscribe>
  );
}

export { FormSubmitButtons };
