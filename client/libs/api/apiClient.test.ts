import { describe, expect, it } from "vitest";
import type { AxiosAdapter } from "axios";

import { ApiClientError, api } from "./apiClient";

const adapterWithData = (data: unknown): AxiosAdapter => {
  return async (config) => ({
    config,
    data,
    headers: {},
    status: 200,
    statusText: "OK",
  });
};

describe("api", () => {
  it("returns API JSON data", async () => {
    await expect(
      api.json.get<{ status: string }>("/api/health", {
        adapter: adapterWithData({ ok: true, data: { status: "ok" } }),
      }),
    ).resolves.toEqual({ status: "ok" });
  });

  it("returns fallback data for malformed JSON responses when provided", async () => {
    await expect(
      api.json.get<{ status: string }>("/api/health", {
        adapter: adapterWithData("<html></html>"),
        fallbackData: { status: "fallback" },
      }),
    ).resolves.toEqual({ status: "fallback" });
  });

  it("throws API client errors for API error envelopes", async () => {
    await expect(
      api.json.get("/api/health", {
        adapter: adapterWithData({
          ok: false,
          error: { code: "NOPE", message: "Nope." },
        }),
      }),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it("returns text responses", async () => {
    await expect(
      api.text.get("/health.txt", {
        adapter: adapterWithData("ok"),
      }),
    ).resolves.toBe("ok");
  });
});
