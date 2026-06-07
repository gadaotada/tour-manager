import { authStore } from "@core/stores";
import { AppPageLayout } from "@components/layouts";
import { getCurrentUser, useAuthRealtimeSync } from "@features/login";
import { ensureRealtimeConnection } from "@libs/realtime";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell")({
  beforeLoad: async () => {
    let user = authStore.getState().user;

    if (!user) {
      user = await getCurrentUser();
    }

    if (!user) {
      throw redirect({ to: "/" });
    }

    ensureRealtimeConnection();
  },
  component: ShellRouteLayout,
});

function ShellRouteLayout() {
  useAuthRealtimeSync();

  return (
    <AppPageLayout>
      <Outlet />
    </AppPageLayout>
  );
}
