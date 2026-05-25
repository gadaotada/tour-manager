import { verify } from "argon2";

import type { ClientUser, LoginInput } from "@tour-manager/shared";
import { disabledUserError, invalidCredentialsError } from "@core/http";

import { authRepository } from "./auth.repository";
import { toClientUser } from "./auth.mapper";

async function login(input: LoginInput): Promise<ClientUser> {
  const user = await authRepository.findUserByUsername(input.username);

  if (!user) {
    throw invalidCredentialsError();
  }

  const isValidPassword = await verify(user.password_hash, input.password);

  if (!isValidPassword) {
    throw invalidCredentialsError();
  }

  if (!Boolean(user.is_enabled)) {
    throw disabledUserError();
  }

  return toClientUser(
    user,
    await authRepository.findUserPermissionOverrides(user.id),
  );
}

async function getCurrentUser(userId: string): Promise<ClientUser | null> {
  const user = await authRepository.findUserById(userId);

  if (!user || !Boolean(user.is_enabled)) {
    return null;
  }

  return toClientUser(
    user,
    await authRepository.findUserPermissionOverrides(user.id),
  );
}

const authService = {
  getCurrentUser,
  login,
};

export { authService };
