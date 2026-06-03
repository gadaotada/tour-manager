import { Button } from "@components/ui/button";
import { useT } from "@libs/i18n";

type PermissionsEditorActionsProps = {
  disabled: boolean;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
};

function PermissionsEditorActions({
  disabled,
  saving,
  onReset,
  onSave,
}: PermissionsEditorActionsProps) {
  const t = useT();

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled={disabled || saving} onClick={onReset}>
        {t("users.detail.permissions.reset")}
      </Button>
      <Button type="button" disabled={disabled || saving} onClick={onSave}>
        {t("users.detail.permissions.save")}
      </Button>
    </div>
  );
}

export { PermissionsEditorActions };
