import { ClientsPage } from "@features/clients";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/clients")({
  staticData: {
    titleKey: "pages.clients.title",
  },
  component: ClientsPage,
});
