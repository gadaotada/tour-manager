import { UsersPage } from "@features/users";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/users")({
  staticData: {
    titleKey: "pages.users.title",
  },
  component: UsersPage,
});
