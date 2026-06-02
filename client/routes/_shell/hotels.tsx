import { HotelsPage } from "@features/hotels";
import { listHotels } from "@features/hotels/hotels.api";
import { normalizeHotelsSearch } from "@features/hotels/hotels.query";
import { hotelsStore } from "@features/hotels/hotels.store";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/hotels")({
  staticData: {
    titleKey: "pages.hotels.title",
  },
  validateSearch: (search) => normalizeHotelsSearch(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const result = await listHotels(deps);
    hotelsStore.getState().setResult(result);

    return result;
  },
  component: HotelsPage,
});
