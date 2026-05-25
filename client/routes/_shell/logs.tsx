import { LogsPage } from "@features/logs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/logs")({
  staticData: {
    titleKey: "pages.logs.title",
  },
  component: LogsPage,
});
