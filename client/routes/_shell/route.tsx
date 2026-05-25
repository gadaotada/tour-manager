import { authStore } from "@core/stores";
import { AppPageLayout } from "@components/layouts";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell")({
  beforeLoad: () => {
    const user = authStore.getState().user;

    if (!user) {
      throw redirect({ to: "/" });
    }
  },
  component: ShellRouteLayout,
});

function ShellRouteLayout() {
  return (
    <AppPageLayout>
      <Outlet />
    </AppPageLayout>
  );
}
