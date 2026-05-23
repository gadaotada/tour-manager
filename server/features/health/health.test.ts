import { describe, expect, it } from "vitest";
import type { Logger } from "@tour-manager/shared";

import { healthService } from "./health.service";

const testLogger: Logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  child: () => testLogger,
};

describe("healthService", () => {
  it("returns health status", async () => {
    expect(healthService.getHealth(testLogger)).toEqual({
      status: "ok",
      service: "tour-manager-server"
    });
  });
});
