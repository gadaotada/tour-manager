import { AuditsPage, listAudits, normalizeAuditSearch } from "@features/logs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/logs")({
  staticData: {
    titleKey: "pages.logs.title",
  },
  validateSearch: (search) => normalizeAuditSearch(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const result = await listAudits(deps);
    //auditStore.getState().setResult(result); // we gonna setup it later

    return result;
  },
  component: AuditsPage,
});
