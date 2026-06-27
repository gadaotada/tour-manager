import { createAppController } from "@core/controllers";
import { requireAuth } from "@features/auth";
import {
    clientIdParamsSchema,
    createClientSchema,
    listClientsQuerySchema,
    updateClientSchema,
} from "@tour-manager/shared";
import { clientsService } from "./clients.service";

const clientsController = createAppController("/clients")
    .with(requireAuth)

    .GET("/list")
        .schemas({ query: listClientsQuerySchema })
        .handle(async (ctx) => {
            const clients = await clientsService.getClients(ctx.parsed.query)
            ctx.reply.success({ data: clients });
        })
    .GET("/:id")
        .schemas({ params: clientIdParamsSchema })
        .handle(async (ctx) => {
            const client = await clientsService.getClient(ctx.parsed.params.id);
            ctx.reply.created({ data: client });
        })

    .POST("/create")
        .schemas({ body: createClientSchema })
        .handle(async (ctx) => {
            const client = await clientsService.createClient(ctx.parsed.body, ctx.origin_socket_id, ctx.user);
            ctx.reply.created({ data: client });
        })

    .PUT("/update")
        .schemas({ body: updateClientSchema })
        .handle(async (ctx) => {
            await clientsService.updateClient(ctx.parsed.body, ctx.origin_socket_id, ctx.user);
            ctx.reply.success({ data: true });
        })

    .DELETE("/:id")
        .schemas({ params: clientIdParamsSchema })
        .handle(async (ctx) => {
            await clientsService.deleteClient(ctx.parsed.params.id, ctx.origin_socket_id, ctx.user)
            ctx.reply.noContent();
        });

export { clientsController };
