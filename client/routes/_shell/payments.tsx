import { PaymentsPage } from "@features/payments";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/payments")({
  staticData: {
    titleKey: "pages.payments.title",
  },
  component: PaymentsPage,
});
