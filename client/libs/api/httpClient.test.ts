import { describe, expect, it } from "vitest";
import type { AxiosAdapter } from "axios";

import { HTTP_RESPONSE_MODE, httpClient, jsonRequest, textRequest } from "./httpClient";

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

  it("configures JSON requests", async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: { ok: true },
      headers: {},
      status: 200,
      statusText: "OK",
    });

    const response = await jsonRequest({ url: "/api/health", adapter });

    expect(response.config.responseType).toBe(HTTP_RESPONSE_MODE.json);
    expect(response.config.headers?.Accept ?? response.config.headers?.accept).toBe("application/json");
  });

  it("configures text requests", async () => {
    const adapter: AxiosAdapter = async (config) => ({
      config,
      data: "ok",
      headers: {},
      status: 200,
      statusText: "OK",
    });

    const response = await textRequest({ url: "/health.txt", adapter });

    expect(response.config.responseType).toBe(HTTP_RESPONSE_MODE.text);
    expect(response.data).toBe("ok");
  });
});
