import { loginSchema } from "@tour-manager/shared";
import { createAppController } from "@core/controllers";
import { unauthenticatedError } from "@core/http";
import { env } from "@libs/config";

import { authService } from "./auth.service";
import { destroySession, regenerateSession, saveSession } from "./auth.session";

const authController = createAppController("/auth")
    .POST("/login")
        .schemas({ body: loginSchema })
        .handle(async (ctx) => {
            const user = await authService.login(ctx.parsed.body);

            await regenerateSession(ctx.req);
            ctx.req.session.userId = user.id;
            await saveSession(ctx.req);

            ctx.reply.success({ data: { user } });
        })
    .POST("/logout")
        .handle(async (ctx) => {
            await destroySession(ctx.req);
            ctx.res.clearCookie(env.sessionCookieName);

            ctx.reply.noContent();
        })
        
    .GET("/me")
        .handle(async (ctx) => {
            const userId = ctx.req.session.userId;

            if (!userId) throw unauthenticatedError();

            const user = await authService.getCurrentUser(userId);

            if (!user) {
                await destroySession(ctx.req);
                ctx.res.clearCookie(env.sessionCookieName);
                throw unauthenticatedError();
            }

            ctx.reply.success({ data: { user } });
        });

export { authController };
