import {
  createUserSchema,
  listUsersQuerySchema,
  PERMISSIONS,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from "@tour-manager/shared";

import { createAppController } from "@core/controllers";
import { requireAnyPermission, requireAuth } from "@features/auth";

import { usersService } from "./users.service";

const usersController = createAppController("/users")
  .with(requireAuth)

  .GET("/list")
    .schemas({ query: listUsersQuerySchema })
    .use(requireAnyPermission([PERMISSIONS.USERS.READ_ANY, PERMISSIONS.USERS.READ_NON_ADMIN]))
    .handle(async (ctx) => {
      const users = await usersService.listUsers(ctx.user, ctx.parsed.query);

      ctx.reply.success({ data: users });
    })

  .POST("/create")
    .schemas({ body: createUserSchema })
    .use(requireAnyPermission([PERMISSIONS.USERS.CREATE_ANY, PERMISSIONS.USERS.CREATE_NON_ADMIN]))
    .handle(async (ctx) => {
      const user = await usersService.createUser(
        ctx.user,
        ctx.parsed.body,
        ctx.origin_socket_id,
      );

      ctx.reply.created({ data: user });
    })

  .PUT("/update")
    .schemas({ body: updateUserSchema })
    .use(requireAnyPermission([PERMISSIONS.USERS.UPDATE_ANY, PERMISSIONS.USERS.UPDATE_NON_ADMIN]))
    .handle(async (ctx) => {
      const user = await usersService.updateUser(
        ctx.user,
        ctx.parsed.body,
        ctx.origin_socket_id,
      );

      ctx.reply.success({ data: user });
    })

  .PUT("/update-status/:id")
    .schemas({ body: updateUserStatusSchema, params: userIdParamsSchema })
    .use(requireAnyPermission([PERMISSIONS.USERS.UPDATE_ANY, PERMISSIONS.USERS.UPDATE_NON_ADMIN]))
    .handle(async (ctx) => {
      const user = await usersService.updateUserStatus(
        ctx.user,
        ctx.parsed.params.id,
        ctx.parsed.body.is_enabled,
        ctx.origin_socket_id,
      );

      ctx.reply.success({ data: user });
    })

  .DELETE("/delete/:id")
    .schemas({ params: userIdParamsSchema })
    .use(requireAnyPermission([PERMISSIONS.USERS.DELETE_ANY, PERMISSIONS.USERS.DELETE_NON_ADMIN]))
    .handle(async (ctx) => {
      await usersService.deleteUser(
        ctx.user,
        ctx.parsed.params.id,
        ctx.origin_socket_id,
      );

      ctx.reply.noContent();
    });

export { usersController };
