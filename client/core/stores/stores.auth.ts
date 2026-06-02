import { create } from "zustand";
import type { ClientUser, UserSettings } from "@tour-manager/shared";
import { normalizeUserSettings } from "@tour-manager/shared";

type AuthStatus = "unknown" | "authenticated" | "anonymous";

type AuthState = {
  status: AuthStatus;
  user: ClientUser | null;
  setUser: (user: ClientUser) => void;
  clearUser: () => void;
  patchSettings: (settings: Partial<UserSettings>) => void;
};

const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  setUser: (user) => {
    set({ status: "authenticated", user });
  },
  clearUser: () => {
    set({ status: "anonymous", user: null });
  },
  patchSettings: (settings) => {
    set((state) => {
      if (!state.user) {
        return state;
      }

      return {
        user: {
          ...state.user,
          settings: normalizeUserSettings({
            ...state.user.settings,
            ...settings,
            table_settings: {
              ...state.user.settings.table_settings,
              ...settings.table_settings,
            },
          }),
        },
      };
    });
  },
}));

const authStore = useAuthStore;

function useAuthUser() {
  return useAuthStore((state) => state.user);
}

function useAuthStatus() {
  return useAuthStore((state) => state.status);
}

function useIsAuthenticated() {
  return useAuthStore((state) => state.status === "authenticated");
}

function useAuthActions() {
  const clearUser = useAuthStore((state) => state.clearUser);
  const patchSettings = useAuthStore((state) => state.patchSettings);
  const setUser = useAuthStore((state) => state.setUser);

  return {
    clearUser,
    patchSettings,
    setUser,
  };
}

export {
  authStore,
  useAuthActions,
  useAuthStatus,
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  type AuthStatus,
};
