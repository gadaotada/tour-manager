import { DashboardPage } from "@features/dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/dashboard")({
  staticData: {
    titleKey: "dashboard.title",
  },
  component: DashboardPage,
});
