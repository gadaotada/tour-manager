import { createAppController } from "@core/controllers";
import { requireAuth, requirePermission } from "@features/auth";
import {
    createHotelSchema,
    hotelIdParamsSchema,
    listHotelsQuerySchema,
    PERMISSIONS,
    updateHotelSchema,
    updateHotelStatusSchema,
} from "@tour-manager/shared";
import { hotelsService } from "./hotels.service";

const hotelsController = createAppController("/hotels")
    .with(requireAuth)

    .GET("/list")
        .schemas({ query: listHotelsQuerySchema })
        .use(requirePermission(PERMISSIONS.HOTELS.READ_ANY))
        .handle(async (ctx) => {
            const hotels = await hotelsService.getHotels(ctx.parsed.query);

            ctx.reply.success({ data: hotels });
        })

    .POST("/create")
        .schemas({ body: createHotelSchema })
        .use(requirePermission(PERMISSIONS.HOTELS.CREATE_ANY))
        .handle(async (ctx) => {
            const hotel = await hotelsService.createHotel(ctx.parsed.body, ctx.origin_socket_id, ctx.user);

            ctx.reply.created({ data: hotel });
        })

    .PUT("/update")
        .schemas({ body: updateHotelSchema })
        .use(requirePermission(PERMISSIONS.HOTELS.UPDATE_ANY))
        .handle(async (ctx) => {
            await hotelsService.updateHotel(ctx.parsed.body, ctx.origin_socket_id, ctx.user);

            ctx.reply.success({ data: true });
        })
    .PUT("/update-status/:id")
        .schemas({ body: updateHotelStatusSchema, params: hotelIdParamsSchema })
        .use(requirePermission(PERMISSIONS.HOTELS.UPDATE_ANY))
        .handle(async (ctx) => {
            const { body, params } = ctx.parsed;
            const payload = {
                id: params.id,
                version: body.version,
                is_active: body.is_active,
            };
            await hotelsService.changeHotelStatus(payload, ctx.origin_socket_id, ctx.user);

            ctx.reply.success({ data: true });
        })

    .DELETE("/delete/:id")
        .schemas({ params: hotelIdParamsSchema })
        .use(requirePermission(PERMISSIONS.HOTELS.DELETE_ANY))
        .handle(async (ctx) => {
            const { id } = ctx.parsed.params;
            await hotelsService.deleteHotel(id, ctx.origin_socket_id, ctx.user);

            ctx.reply.noContent();
        });

export { hotelsController };
