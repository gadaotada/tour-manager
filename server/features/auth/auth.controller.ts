import { loginSchema } from "@tour-manager/shared";
import { BaseController } from "@core/controllers";
import { unauthenticatedError } from "@core/http";
import { validateRequest } from "@core/validation/validateRequest";
import { env } from "@libs/config";

import { authService } from "./auth.service";
import { destroySession, regenerateSession, saveSession } from "./auth.session";

class AuthController extends BaseController {
  basePath = "/auth";

  routes = [
    this.post("/login", async (ctx) => {
      const { body } = validateRequest(ctx.req, { body: loginSchema });
      const user = await authService.login(body);

      await regenerateSession(ctx.req);
      ctx.req.session.userId = user.id;
      await saveSession(ctx.req);

      return this.ok({ user });
    }),

    this.post("/logout", async (ctx) => {
      await destroySession(ctx.req);
      ctx.res.clearCookie(env.sessionCookieName);

      return this.noContent();
    }),

    this.get("/me", async (ctx) => {
      const userId = ctx.req.session.userId;

      if (!userId) {
        throw unauthenticatedError();
      }

      const user = await authService.getCurrentUser(userId);

      if (!user) {
        await destroySession(ctx.req);
        ctx.res.clearCookie(env.sessionCookieName);
        throw unauthenticatedError();
      }

      return this.ok({ user });
    }),
  ];
}

const authController = new AuthController();

export { authController };
