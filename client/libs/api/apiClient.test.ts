import { describe, expect, it } from "vitest";
import type { AxiosAdapter } from "axios";

import { ApiClientError, api } from "./apiClient";

const adapterWithData = (data: unknown, status = 200): AxiosAdapter => {
  return async (config) => ({
    config,
    data,
    headers: {},
    status,
    statusText: status === 200 ? "OK" : "Error",
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

  it("throws API client errors for non-2xx API error envelopes", async () => {
    await expect(
      api.json.post("/api/auth/login", { username: "x", password: "y" }, {
        adapter: adapterWithData(
          {
            ok: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid username or password.",
            },
          },
          401,
        ),
      }),
    ).rejects.toMatchObject({
      message: "Invalid username or password.",
      payload: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid username or password.",
      },
      status: 401,
    });
  });

  it("returns undefined for 204 No Content void responses", async () => {
    await expect(
      api.json.post<void>("/api/auth/logout", undefined, {
        adapter: adapterWithData(undefined, 204),
      }),
    ).resolves.toBeUndefined();
  });

  it("returns text responses", async () => {
    await expect(
      api.text.get("/health.txt", {
        adapter: adapterWithData("ok"),
      }),
    ).resolves.toBe("ok");
  });
});
