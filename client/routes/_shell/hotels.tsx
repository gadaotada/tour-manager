import { HotelsPage } from "@features/hotels";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/hotels")({
  staticData: {
    titleKey: "pages.hotels.title",
  },
  component: HotelsPage,
});
