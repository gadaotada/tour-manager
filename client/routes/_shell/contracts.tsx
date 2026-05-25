import { ContractsPage } from "@features/contracts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/contracts")({
  staticData: {
    titleKey: "pages.contracts.title",
  },
  component: ContractsPage,
});
