import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@tanstack/react-router";

import {
  realtimeScopeActiveUsersEventSchema,
  type RealtimeScopeActiveUser,
  type RealtimeScopeActiveUsersEvent,
} from "@tour-manager/shared";

import {
  useRealtimeEvents,
  useRealtimeScope,
  type RealtimeEventBinding,
  type RouteRealtimeScope,
} from "@libs/realtime";
import { APP_PATHS } from "@libs/routes/app-paths";

type PagePresence = {
  active_users: number | null;
  users: RealtimeScopeActiveUser[];
};

const PATH_SCOPE_ENTRIES = [
  [APP_PATHS.clients, "clients"],
  [APP_PATHS.contracts, "contracts"],
  [APP_PATHS.dashboard, "dashboard"],
  [APP_PATHS.hotels, "hotels"],
  [APP_PATHS.logs, "logs"],
  [APP_PATHS.payments, "payments"],
  [APP_PATHS.settings, "settings"],
  [APP_PATHS.templates, "templates"],
  [APP_PATHS.users, "users"],
] as const satisfies readonly (readonly [string, RouteRealtimeScope])[];

function usePagePresence(): PagePresence {
  const { pathname } = useLocation();
  const scope = useMemo(() => getRouteScope(pathname), [pathname]);
  const [presence, setPresence] = useState<PagePresence>({
    active_users: null,
    users: [],
  });

  useRealtimeScope(scope);

  useEffect(() => {
    setPresence({ active_users: null, users: [] });
  }, [scope]);

  const realtimeEvents = useMemo(() => {
    if (!scope) {
      return [] as RealtimeEventBinding<RealtimeScopeActiveUsersEvent>[];
    }

    return [
      {
        eventType: "scope.active_users",
        parse: (payload: unknown) => {
          const parsed = realtimeScopeActiveUsersEventSchema.safeParse(payload);
          return parsed.success ? parsed.data : null;
        },
        handler: (event: RealtimeScopeActiveUsersEvent) => {
          if (event.scope !== scope) {
            return;
          }

          setPresence({
            active_users: event.active_users,
            users: event.users,
          });
        },
      },
    ] as RealtimeEventBinding<RealtimeScopeActiveUsersEvent>[];
  }, [scope]);

  useRealtimeEvents(realtimeEvents);

  return presence;
}

function getRouteScope(pathname: string): RouteRealtimeScope | null {
  for (const [path, scope] of PATH_SCOPE_ENTRIES) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return scope;
    }
  }

  return null;
}

export { usePagePresence, type PagePresence };
