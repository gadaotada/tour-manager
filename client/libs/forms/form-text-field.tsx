import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { FormFieldError, hasFormErrors } from "./form-field-error";

type TextFormField = {
  handleBlur: () => void;
  handleChange: (value: string) => void;
  name: string;
  state: {
    meta: {
      errors: readonly unknown[];
    };
    value: string;
  };
};

type FormTextFieldProps = {
  autoComplete?: string;
  disabled?: boolean;
  errorClassName?: string;
  field: TextFormField;
  id: string;
  label: string;
  onChange?: () => void;
  type?: "email" | "password" | "search" | "tel" | "text" | "url";
};

function FormTextField({
  autoComplete,
  disabled,
  errorClassName,
  field,
  id,
  label,
  onChange,
  type = "text",
}: FormTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={field.name}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        value={field.state.value}
        aria-invalid={hasFormErrors(field.state.meta.errors)}
        onBlur={field.handleBlur}
        onChange={(event) => {
          onChange?.();
          field.handleChange(event.target.value);
        }}
      />
      <FormFieldError className={errorClassName} errors={field.state.meta.errors} />
    </div>
  );
}

export { FormTextField };
