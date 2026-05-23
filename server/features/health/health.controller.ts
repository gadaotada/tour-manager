import { BaseController, type Ctx } from "../../core/controllers/BaseController";

import { healthService } from "./health.service";

class HealthController extends BaseController {
  basePath = "/health";
  routes = [{ method: "get", path: "", handler: this.getHealth }] as const;

  private getHealth(_ctx: Ctx) {
    return this.ok(healthService.getHealth());
  }
}

export const healthController = new HealthController();
