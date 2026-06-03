import { UsersPage } from "@features/users";
import { listUsers } from "@features/users/users.api";
import { normalizeUsersSearch } from "@features/users/users.query";
import { usersStore } from "@features/users/users.store";
import { authStore } from "@core/stores";
import { APP_PATHS } from "@libs/routes/app-paths";
import { PERMISSIONS, hasPermission } from "@tour-manager/shared";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/users")({
  staticData: {
    titleKey: "pages.users.title",
  },
  validateSearch: (search) => normalizeUsersSearch(search),
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
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const result = await listUsers(deps);
    usersStore.getState().setResult(result);

    return result;
  },
  component: UsersPage,
});
