import { TemplatesPage } from "@features/templates";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/templates")({
  staticData: {
    titleKey: "pages.templates.title",
  },
  component: TemplatesPage,
});
