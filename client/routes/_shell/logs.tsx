import { AuditsPage, auditStore, listAudits, normalizeAuditSearch } from "@features/logs";
import { authStore } from "@core/stores";
import { APP_PATHS } from "@libs/routes/app-paths";
import { PERMISSIONS, hasPermission } from "@tour-manager/shared";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/logs")({
  staticData: {
    titleKey: "pages.logs.title",
  },
  validateSearch: (search) => normalizeAuditSearch(search),
  beforeLoad: () => {
    const user = authStore.getState().user;

    if (!hasPermission(user?.permissions, PERMISSIONS.AUDIT.READ_ANY)) {
      // TanStack Router redirects are intentionally thrown.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: APP_PATHS.dashboard });
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const result = await listAudits(deps);
    auditStore.getState().setResult(result);

    return result;
  },
  component: AuditsPage,
});
