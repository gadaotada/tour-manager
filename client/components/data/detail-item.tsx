import { cn } from "@libs/utils";

type DetailItemProps = {
  className?: string;
  label: string;
  value: string;
};

function DetailItem({ className, label, value }: DetailItemProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-base">{value}</dd>
    </div>
  );
}

export { DetailItem };
