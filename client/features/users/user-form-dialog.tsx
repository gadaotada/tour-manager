import {
  ROLES,
  type CreateUserInput,
  type ManagedUser,
} from "@tour-manager/shared";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { useT } from "@libs/i18n";

import { UserForm } from "./components/user-form";

type UserFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  user: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const DEFAULT_USER_FORM_VALUES = {
  username: "",
  display_name: "",
  role: ROLES.EMPLOYEE,
  is_enabled: true,
  password: "",
} satisfies CreateUserInput;

function UserFormDialog({
  mode,
  open,
  user,
  onOpenChange,
  onSuccess,
}: UserFormDialogProps) {
  const t = useT();
  const isEdit = mode === "edit";
  const defaultValues =
    isEdit && user
      ? {
          username: user.username,
          display_name: user.display_name,
          role: user.role,
          is_enabled: user.is_enabled,
          password: "",
        }
      : DEFAULT_USER_FORM_VALUES;
  const formKey = isEdit && user ? `edit-${user.id}` : "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("users.form.editTitle") : t("users.form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("users.form.editDescription") : t("users.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <UserForm
            key={formKey}
            defaultValues={defaultValues}
            isEdit={isEdit}
            targetUser={user}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export { UserFormDialog };
