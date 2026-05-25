import { AppError } from "@core/http";
import type { Logger } from "@tour-manager/shared";

export const healthService = {
  getHealth(logger: Logger) {
    logger.debug({ area: "health", caller: "healthService.getHealth" }, "Health check requested");

    return {
      status: "ok",
      service: "tour-manager-server"
    };
  },

  simulateError(logger: Logger) {
    logger.error({ area: "health", caller: "healthService.simulateError" }, "Simulated error");
    throw new AppError(400, "TEST_ERROR", "errors.db.general", "This is a simulated error for testing purposes");
  }
};
