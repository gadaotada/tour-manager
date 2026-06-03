import { cn } from "@libs/utils";

type ListPageSectionProps = {
  children: React.ReactNode;
  className?: string;
  empty: boolean;
  emptyMessage: string;
  loading: boolean;
  loadingMessage: string;
  pagination?: React.ReactNode;
  toolbar: React.ReactNode;
};

function ListPageSection({
  children,
  className,
  empty,
  emptyMessage,
  loading,
  loadingMessage,
  pagination,
  toolbar,
}: ListPageSectionProps) {
  return (
    <section
      className={cn(
        "flex min-h-full flex-1 flex-col gap-4 rounded-lg bg-card shadow-sm lg:p-4",
        className,
      )}
    >
      <div className="shrink-0 space-y-3 rounded-md bg-card">
        {toolbar}
        {!loading ? pagination : null}
      </div>

      {loading ? (
        <p className="text-base text-muted-foreground">{loadingMessage}</p>
      ) : null}

      {!loading && empty ? (
        <p className="rounded-md border border-dashed px-4 py-8 text-center text-base text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}

      {!loading && !empty ? <div className="min-h-0 flex-1">{children}</div> : null}
    </section>
  );
}

export { ListPageSection, type ListPageSectionProps };
