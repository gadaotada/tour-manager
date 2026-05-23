import { describe, expect, it, vi } from "vitest";

import { requestJson } from "./httpClient";

describe("requestJson", () => {
  it("returns API data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ ok: true, data: { status: "ok" } })
      })),
    );

    await expect(requestJson("/api/health")).resolves.toEqual({ status: "ok" });
  });
});
