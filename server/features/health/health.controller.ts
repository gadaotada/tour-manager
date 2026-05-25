import { BaseController } from "@core/controllers";

import { healthService } from "./health.service";

class HealthController extends BaseController {
  basePath = "/health";
  baseMiddlewares = [];

  routes = [
    this.get("", async (ctx) => {
      return this.ok(
        healthService.getHealth(ctx.logger.child({ area: "health" })),
      );
    }),

    this.put("/simulate-error", async (ctx) => {
      healthService.simulateError(ctx.logger.child({ area: "health" }));
      return this.ok({ message: "Error simulated" });
    }),
  ];
}

export const healthController = new HealthController();
