import type { Request, RequestHandler } from "express";
import type { ClientUser, Permission } from "@tour-manager/shared";
import { hasPermission } from "@tour-manager/shared";

import { forbiddenError, unauthenticatedError } from "@core/http";

import { authService } from "./auth.service";
import { destroySession } from "./auth.session";

const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const user = await getSessionUser(req);
    res.locals.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

function requirePermission(permission: Permission): RequestHandler {
  return async (req, res, next) => {
    try {
      const user = await getSessionUser(req);

      if (!hasPermission(user.permissions, permission)) {
        next(forbiddenError());
        return;
      }

      res.locals.currentUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function getSessionUser(req: Request): Promise<ClientUser> {
  const userId = req.session.userId;

  if (!userId) {
    throw unauthenticatedError();
  }

  const user = await authService.getCurrentUser(userId);

  if (!user) {
    await destroySession(req);
    throw unauthenticatedError();
  }

  return user;
}

export { requireAuth, requirePermission };
