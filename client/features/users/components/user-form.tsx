import { useForm } from "@tanstack/react-form";

import {
  ROLES,
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type ManagedUser,
  type Role,
} from "@tour-manager/shared";

import { DialogFooter } from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  FormFieldError,
  FormSubmitButtons,
  FormTextField,
  clearFieldServerError,
  createApiFieldErrors,
  getSubmitErrorMessage,
  hasFormErrors,
} from "@libs/forms";
import { useT } from "@libs/i18n";
import { toast } from "@libs/toasts";

import { useUserPermissions } from "../use-user-permissions";
import { createUser, updateUser } from "../users.api";

type UserFormProps = {
  defaultValues: CreateUserInput;
  isEdit: boolean;
  targetUser: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const USER_FORM_FIELDS = ["username", "display_name", "role", "is_enabled", "password"] as const;

function UserForm({
  defaultValues,
  isEdit,
  targetUser,
  onOpenChange,
  onSuccess,
}: UserFormProps) {
  const t = useT();
  const { canCreateAny, canUpdateAny } = useUserPermissions();
  const roleOptions = getRoleOptions(isEdit ? canUpdateAny : canCreateAny);
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: (isEdit ? updateUserSchema.omit({ id: true }) : createUserSchema) as never,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  async function onSubmit(values: CreateUserInput) {
    try {
      if (isEdit && targetUser) {
        await updateUser({
          ...values,
          id: targetUser.id,
        });
      } else {
        await createUser(values);
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const message = getSubmitErrorMessage(error, t("users.form.error.fallback"));
      const apiErrors = createApiFieldErrors(error, USER_FORM_FIELDS, t);

      if (Object.values(apiErrors).some(Boolean)) {
        form.setErrorMap({
          onServer: {
            fields: apiErrors,
            form: apiErrors.root ?? message,
          },
        } as never);
      }

      toast.error(message);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit().catch((error: unknown) => {
          toast.error(getSubmitErrorMessage(error, t("users.form.error.fallback")));
        });
      }}
    >
      <form.Field name="username">
        {(field) => (
          <FormTextField
            id="user-username"
            label={t("users.form.username")}
            field={field}
            errorClassName="text-base text-destructive"
          />
        )}
      </form.Field>

      <form.Field name="display_name">
        {(field) => (
          <FormTextField
            id="user-display-name"
            label={t("users.form.display_name")}
            field={field}
            errorClassName="text-base text-destructive"
          />
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <FormTextField
            id="user-password"
            label={isEdit ? t("users.form.passwordOptional") : t("users.form.password")}
            field={field}
            type="password"
            errorClassName="text-base text-destructive"
          />
        )}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="user-role">{t("users.form.role")}</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                clearFieldServerError(field);
                field.handleChange(value as Role);
              }}
            >
              <SelectTrigger
                id="user-role"
                className="w-full"
                aria-invalid={hasFormErrors(field.state.meta.errors)}
                onBlur={field.handleBlur}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`users.roles.${role}`)}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            <FormFieldError className="text-base text-destructive" errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="is_enabled">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              checked={field.state.value}
              className="size-4"
              type="checkbox"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.checked)}
            />
            {t("users.form.is_enabled")}
          </label>
        )}
      </form.Field>

      <DialogFooter>
        <FormSubmitButtons
          form={form}
          requireDirty
          cancelLabel={t("common.actions.cancel")}
          submittingLabel={t("common.actions.saving")}
          submitLabel={isEdit ? t("users.form.save") : t("users.form.create")}
          onCancel={() => onOpenChange(false)}
        />
      </DialogFooter>
    </form>
  );
}

function getRoleOptions(canManageAdminUsers: boolean): Role[] {
  return canManageAdminUsers
    ? [ROLES.ADMIN, ROLES.MODERATOR, ROLES.EMPLOYEE]
    : [ROLES.MODERATOR, ROLES.EMPLOYEE];
}

export { UserForm };
