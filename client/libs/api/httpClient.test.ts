import { describe, expect, it } from "vitest";
import type { AxiosAdapter } from "axios";

import { httpClient } from "./httpClient";

describe("httpClient", () => {
  it("returns API responses", async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: { ok: true, data: { status: "ok" } },
      headers: {},
      status: 200,
      statusText: "OK",
    });

    await expect(httpClient.get("/api/health", { adapter })).resolves.toMatchObject({
      data: { ok: true, data: { status: "ok" } },
    });
  });
});
