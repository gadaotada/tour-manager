import { createAppController } from "@core/controllers";
import { requireAuth } from "@features/auth";
import { updateUserSettingsSchema } from "@tour-manager/shared";

import { settingsUserService } from "./settings.user.service";

const settingsUserController = createAppController("/settings/user")
    .with(requireAuth)

    .GET("/list")
        .handle(async (ctx) => {
            const settings = await settingsUserService.getUserSettings(ctx.user.id);

            ctx.reply.success({ data: settings });
        })

    .PUT("/update")
        .schemas({ body: updateUserSettingsSchema })
        .handle(async (ctx) => {
            const settings = await settingsUserService.updateUserSettings(
                ctx.user.id,
                ctx.parsed.body,
            );

            ctx.reply.success({ data: settings });
        })

    .DELETE("/delete")
        .handle(async (ctx) => {
            const settings = await settingsUserService.deleteUserSettings(ctx.user.id);

            ctx.reply.success({ data: settings });
        });

export { settingsUserController };
