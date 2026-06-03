import { createFileRoute, redirect } from "@tanstack/react-router";
import { PERMISSIONS, hasPermission } from "@tour-manager/shared";

import { authStore } from "@core/stores";
import { UserDetailPage } from "@features/users";
import { getUserDetail } from "@features/users/users.api";
import { APP_PATHS } from "@libs/routes/app-paths";

export const Route = createFileRoute("/_shell/users_/$userId")({
  staticData: {
    titleKey: "pages.users.title",
  },
  beforeLoad: () => {
    const user = authStore.getState().user;

    if (
      !hasPermission(user?.permissions, PERMISSIONS.USERS.READ_ANY) &&
      !hasPermission(user?.permissions, PERMISSIONS.USERS.READ_NON_ADMIN)
    ) {
      // TanStack Router redirects are intentionally thrown.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: APP_PATHS.dashboard });
    }
  },
  loader: async ({ params }) => getUserDetail(params.userId),
  component: UserDetailRoute,
});

function UserDetailRoute() {
  const user = Route.useLoaderData();

  return <UserDetailPage user={user} />;
}
