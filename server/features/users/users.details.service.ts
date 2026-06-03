import type { ClientUser, UserDetail } from "@tour-manager/shared";

import { AppError } from "@core/http";
import { usersPermissionsRepository } from "./users.permissions.repository";
import { assertCanReadRole } from "./users.policy";
import { usersRepository } from "./users.repository";

async function getUserDetail(actor: ClientUser, userId: string): Promise<UserDetail> {
  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "errors.db.notFound",
      "Record was not found.",
    );
  }

  assertCanReadRole(actor, user.role);

  const permission_overrides =
    await usersPermissionsRepository.listUserPermissionOverrides(user.id);

  return {
    ...user,
    permission_overrides,
  };
}

const usersDetailsService = {
  getUserDetail,
};

export { usersDetailsService };
