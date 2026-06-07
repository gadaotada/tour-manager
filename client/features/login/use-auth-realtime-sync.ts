import { useEffect, useRef } from "react";

import {
  AUTH_REALTIME_EVENTS,
  PERMISSIONS,
  hasPermission,
  type ClientUser,
  type Permission,
} from "@tour-manager/shared";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";

import { APP_PATHS } from "@libs/routes/app-paths";
import { subscribeRealtimeEvent } from "@libs/realtime";

import { refreshCurrentUser } from "./login.api";

function useAuthRealtimeSync() {
  const navigate = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    return subscribeRealtimeEvent(AUTH_REALTIME_EVENTS.SESSION_CHANGE, () => {
      refreshCurrentUser()
        .then((user) => {
          if (!user) {
            return navigate({ to: "/" });
          }

          if (!canAccessPath(pathnameRef.current, user)) {
            return navigate({ to: APP_PATHS.dashboard });
          }

          return router.invalidate();
        })
        .catch((error: unknown) => {
          console.error("Failed to sync auth session.", error);
        });
    });
  }, [navigate, router]);
}

function canAccessPath(pathname: string, user: ClientUser): boolean {
  if (isPathMatch(pathname, APP_PATHS.logs)) {
    return hasPermission(user.permissions, PERMISSIONS.AUDIT.READ_ANY);
  }

  if (isPathMatch(pathname, APP_PATHS.users)) {
    return hasAnyPermission(user.permissions, [
      PERMISSIONS.USERS.READ_ANY,
      PERMISSIONS.USERS.READ_NON_ADMIN,
    ]);
  }

  return true;
}

function hasAnyPermission(
  permissions: readonly Permission[],
  requiredPermissions: readonly Permission[],
): boolean {
  return requiredPermissions.some((permission) => hasPermission(permissions, permission));
}

function isPathMatch(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export { useAuthRealtimeSync };
