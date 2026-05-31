import { t, type MessageKey } from "@libs/i18n";

type PlaceholderPageProps = {
  emptyKey: MessageKey;
  titleKey: MessageKey;
};

function PlaceholderPage({ emptyKey, titleKey }: PlaceholderPageProps) {
  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm lg:p-8">
      <h2 className="text-base font-semibold tracking-normal lg:text-lg">
        {t(titleKey)}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base lg:leading-7">
        {t(emptyKey)}
      </p>
    </section>
  );
}

export { PlaceholderPage };
