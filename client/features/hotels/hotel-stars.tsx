import { StarIcon } from "lucide-react";

import { cn } from "@libs/utils";

type HotelStarsProps = {
  className?: string;
  max?: number;
  value: number;
};

function HotelStars({ className, max = 6, value }: HotelStarsProps) {
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

export { HotelStars };
