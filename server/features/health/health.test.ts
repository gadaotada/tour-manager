import { describe, expect, it } from "vitest";
import type { Logger } from "@tour-manager/shared";
import request from "supertest";

import { createApp } from "../../app";
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

  it("returns AppError responses from simulated errors", async () => {
    const response = await request(createApp())
      .put("/api/health/simulate-error")
      .expect(400);

    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "TEST_ERROR",
        message: "Database operation failed.",
      },
    });
  });
});
