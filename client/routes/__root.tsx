import { TooltipProvider } from "@components/ui/tooltip";
import { useLocaleStore } from "@libs/i18n";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <TooltipProvider>
      <Outlet key={locale} />
    </TooltipProvider>
  );
}
