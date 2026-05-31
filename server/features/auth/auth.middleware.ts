import type { Request } from "express";
import type { ClientUser, Permission } from "@tour-manager/shared";
import { hasPermission } from "@tour-manager/shared";

import type { AppMiddleware, RouteMiddleware } from "@core/controllers";
import { forbiddenError, unauthenticatedError } from "@core/http";

import { authService } from "./auth.service";
import { destroySession } from "./auth.session";

const requireAuth: AppMiddleware<{ user: ClientUser }> = async (ctx) => {
    const user = await getSessionUser(ctx.req);
    return { user };
};

function requirePermission(permission: Permission): RouteMiddleware<object, { user: ClientUser }> {
    return (ctx) => {
        if (!hasPermission(ctx.user.permissions, permission)) {
            throw forbiddenError();
        }

        return ctx.proceed();
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
