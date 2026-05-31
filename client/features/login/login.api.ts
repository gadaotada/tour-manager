import { api } from "@libs/api";
import { authStore } from "@core/stores";
import { disconnectRealtime } from "@libs/realtime";
import type { ClientUser, LoginInput } from "@tour-manager/shared";

type AuthUserResponse = {
  user: ClientUser;
};

async function login(input: LoginInput): Promise<ClientUser> {
  const { setUser } = authStore.getState();
  const { user } = await api.json.post<AuthUserResponse>("/api/auth/login", input);

  setUser(user);

  return user;
}

async function getCurrentUser(): Promise<ClientUser | null> {
  const { status, user, setUser, clearUser } = authStore.getState();

  if (status === "authenticated" && user) {
    return user;
  }

  if (status === "anonymous") {
    return null;
  }

  try {
    const { user: nextUser } = await api.json.get<AuthUserResponse>("/api/auth/me");
    setUser(nextUser);

    return nextUser;
  } catch {
    clearUser();
    return null;
  }
}

async function logout(): Promise<void> {
  try {
    await api.json.post<null>("/api/auth/logout");
  } finally {
    disconnectRealtime();
    authStore.getState().clearUser();
  }
}

export { getCurrentUser, login, logout };
