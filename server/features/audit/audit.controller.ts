import { createAppController } from "@core/controllers";
import { requireAuth, requirePermission } from "@features/auth";
import { listAuditLogsQuerySchema, PERMISSIONS } from "@tour-manager/shared";
import { auditService } from "./audit.service";

const auditController = createAppController("/audit")
    .with(requireAuth)

    .GET("/list")
        .use(requirePermission(PERMISSIONS.AUDIT.READ_ANY))
        .schemas({ query: listAuditLogsQuerySchema })
        .handle(async (ctx) => {
            const audits = await auditService.listLogs(ctx.user, ctx.parsed.query);

            ctx.reply.success({ data: audits });
        });

export { auditController };
