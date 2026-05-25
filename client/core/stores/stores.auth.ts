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
            tableSettings: {
              ...state.user.settings.tableSettings,
              ...settings.tableSettings,
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
  return useAuthStore((state) => ({
    clearUser: state.clearUser,
    patchSettings: state.patchSettings,
    setUser: state.setUser,
  }));
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
