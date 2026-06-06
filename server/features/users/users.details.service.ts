import type { ClientUser, UserDetail } from "@tour-manager/shared";

import { AppError } from "@core/http";
import { assertCanReadRole } from "./users.policy";
import { usersRepository } from "./users.repository";

async function getUserDetail(actor: ClientUser, userId: string): Promise<UserDetail> {
  const user = await usersRepository.findUserDetailById(userId);

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "errors.db.notFound",
      "Record was not found.",
    );
  }

  assertCanReadRole(actor, user.role);

  return user;
}

const usersDetailsService = {
  getUserDetail,
};

export { usersDetailsService };
