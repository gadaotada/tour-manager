import { createAppController } from "@core/controllers";

import { healthService } from "./health.service";

const healthController = createAppController("/health")
    .GET("")
        .handle((ctx) => {
            const health = healthService.getHealth(ctx.logger.child({ area: "health" }));
            ctx.reply.success({ data: health });
        })
    .PUT("/simulate-error")
        .handle((ctx) => {
            healthService.simulateError(ctx.logger.child({ area: "health" }));
            ctx.reply.success({ data: { message: "Error simulated" } });
        });

export { healthController };
