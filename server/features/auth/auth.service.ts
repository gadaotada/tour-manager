import { verify } from "argon2";

import type { ClientUser, LoginInput } from "@tour-manager/shared";
import { disabledUserError, invalidCredentialsError } from "@core/http";

import { authRepository } from "./auth.repository";
import { toClientUser } from "./auth.mapper";

async function login(input: LoginInput): Promise<ClientUser> {
  const result = await authRepository.findUserWithPermissionsByUsername(input.username);

  if (!result) {
    throw invalidCredentialsError();
  }

  const { user, permission_overrides } = result;
  const isValidPassword = await verify(user.password_hash, input.password);

  if (!isValidPassword) {
    throw invalidCredentialsError();
  }

  if (!Boolean(user.is_enabled)) {
    throw disabledUserError();
  }

  return toClientUser(user, permission_overrides);
}

async function getCurrentUser(userId: string): Promise<ClientUser | null> {
  const result = await authRepository.findUserWithPermissionsById(userId);

  if (!result || !Boolean(result.user.is_enabled)) {
    return null;
  }

  return toClientUser(result.user, result.permission_overrides);
}

const authService = {
  getCurrentUser,
  login,
};

export { authService };
