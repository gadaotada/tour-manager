import { ClientsPage } from "@features/clients";
import { listClients } from "@features/clients/clients.api";
import { normalizeClientsSearch } from "@features/clients/clients.query";
import { clientsStore } from "@features/clients/clients.store";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/clients")({
    staticData: {
        titleKey: "pages.clients.title",
    },
    validateSearch: (search) => normalizeClientsSearch(search),
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => {
        const result = await listClients(deps);
        clientsStore.getState().setResult(result);

        return result;
    },
    component: ClientsPage,
});
