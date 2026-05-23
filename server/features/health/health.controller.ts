import { BaseController, ROUTE_METHOD, type Ctx } from "../../core/controllers/BaseController";

import { healthService } from "./health.service";

class HealthController extends BaseController {
  basePath = "/health";
  routes = [{ method: ROUTE_METHOD.get, path: "", handler: this.getHealth }];

  private getHealth(ctx: Ctx) {
    return this.ok(healthService.getHealth(ctx.logger.child({ area: "health" })));
  }
}

export const healthController = new HealthController();
