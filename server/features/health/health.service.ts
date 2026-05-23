import type { Logger } from "@tour-manager/shared";

export const healthService = {
  getHealth(logger: Logger) {
    logger.debug({ area: "health", caller: "healthService.getHealth" }, "Health check requested");

    return {
      status: "ok",
      service: "tour-manager-server"
    };
  }
};
