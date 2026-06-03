import { PERMISSION_EFFECTS } from "@tour-manager/shared";

import { cn } from "@libs/utils";
import { useT } from "@libs/i18n";

import type { OverrideValue } from "./permissions-editor.types";

type PermissionOverrideControlProps = {
  disabled: boolean;
  value: OverrideValue;
  onChange: (value: OverrideValue) => void;
};

const OVERRIDE_OPTIONS: OverrideValue[] = [
  "DEFAULT",
  PERMISSION_EFFECTS.ALLOW,
  PERMISSION_EFFECTS.DENY,
];

function PermissionOverrideControl({
  disabled,
  value,
  onChange,
}: PermissionOverrideControlProps) {
  const t = useT();

  return (
    <div className="inline-grid grid-cols-3 rounded-md border bg-background p-0.5">
      {OVERRIDE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          className={cn(
            "h-7 px-2 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            value === option
              ? "rounded-sm bg-primary text-primary-foreground"
              : "rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => onChange(option)}
        >
          {getOverrideLabel(option, t)}
        </button>
      ))}
    </div>
  );
}

function getOverrideLabel(option: OverrideValue, t: ReturnType<typeof useT>): string {
  if (option === "DEFAULT") {
    return t("users.detail.permissions.default");
  }

  return option === PERMISSION_EFFECTS.ALLOW
    ? t("users.detail.permissions.allow")
    : t("users.detail.permissions.deny");
}

export { PermissionOverrideControl };
