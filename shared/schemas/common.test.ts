import { describe, expect, it } from "vitest";

import { paginationQuerySchema } from "./common";

describe("paginationQuerySchema", () => {
  it("coerces default pagination", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 25 });
  });
});
