type ListPageSectionProps = {
  children: React.ReactNode;
  empty: boolean;
  emptyMessage: string;
  loading: boolean;
  loadingMessage: string;
  pagination?: React.ReactNode;
  toolbar: React.ReactNode;
};

function ListPageSection({
  children,
  empty,
  emptyMessage,
  loading,
  loadingMessage,
  pagination,
  toolbar,
}: ListPageSectionProps) {
  return (
    <section className="space-y-4 rounded-lg bg-card shadow-sm lg:p-4">
      <div className="space-y-3 rounded-md bg-card">
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

      {!loading && !empty ? children : null}
    </section>
  );
}

export { ListPageSection, type ListPageSectionProps };
