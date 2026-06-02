import { StarIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useT } from "@libs/i18n";
import { cn } from "@libs/utils";

type StarsSelectProps = {
  ariaInvalid?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  max?: number;
  onBlur?: () => void;
  onValueChange: (value: number) => void;
  value: number;
};

function StarsSelect({
  ariaInvalid,
  className,
  disabled,
  id,
  max = 6,
  onBlur,
  onValueChange,
  value,
}: StarsSelectProps) {
  const t = useT();
  const safeMax = Math.max(1, max);

  return (
    <Select
      disabled={disabled}
      value={String(value)}
      onValueChange={(nextValue) => onValueChange(Number(nextValue))}
    >
      <SelectTrigger
        id={id}
        className={className}
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: safeMax + 1 }, (_, index) => (
          <SelectItem key={index} value={String(index)}>
            <span className="flex items-center gap-2">
              <StarsValue value={index} max={safeMax} />
              <span>{t("common.stars.option").replace("{count}", String(index))}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type StarsValueProps = {
  className?: string;
  max?: number;
  value: number;
};

function StarsValue({ className, max = 6, value }: StarsValueProps) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(Math.max(0, Math.round(value)), safeMax);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${safeValue} of ${safeMax} stars`}
    >
      {Array.from({ length: safeMax }, (_, index) => {
        const active = index < safeValue;

        return (
          <StarIcon
            key={index}
            aria-hidden="true"
            className={cn(
              "size-3.5 shrink-0",
              active
                ? "fill-warning text-warning"
                : "fill-transparent text-muted-foreground/35",
            )}
          />
        );
      })}
    </span>
  );
}

export { StarsSelect, StarsValue, type StarsSelectProps, type StarsValueProps };
