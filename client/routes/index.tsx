import { APP_PATHS } from "@libs/routes/app-paths";
import { LoginPage, getCurrentUser } from "@features/login";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const user = await getCurrentUser();

    if (user) {
      throw redirect({ to: APP_PATHS.dashboard });
    }

    return null;
  },
  component: LoginPage,
});
