import { describe, expect, it } from "vitest";

import { healthService } from "./health.service";

describe("healthService", () => {
  it("returns health status", async () => {
    expect(healthService.getHealth()).toEqual({
      status: "ok",
      service: "tour-manager-server"
    });
  });
});
