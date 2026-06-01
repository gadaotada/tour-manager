import { describe, expect, it } from "vitest";

import {
    createSortedListQuerySchema,
    createTranslatedSortedListQuerySchema,
    paginationQuerySchema,
    sortDirSchema,
} from "./common";

describe("paginationQuerySchema", () => {
    it("coerces default pagination", () => {
        expect(paginationQuerySchema.parse({})).toEqual({ page: 1, page_size: 25 });
    });
});

describe("sortDirSchema", () => {
    it("accepts ASC and DESC", () => {
        expect(sortDirSchema.parse("ASC")).toBe("ASC");
        expect(sortDirSchema.parse("DESC")).toBe("DESC");
    });
});

describe("createSortedListQuerySchema", () => {
    it("applies sort defaults", () => {
        const schema = createSortedListQuerySchema(["name", "created_at"] as const, {
            sort_by: "created_at",
            sort_dir: "DESC",
        });

        expect(schema.parse({})).toEqual({
            page: 1,
            page_size: 25,
            sort_by: "created_at",
            sort_dir: "DESC",
        });
    });
});

describe("createTranslatedSortedListQuerySchema", () => {
    it("applies pagination and sort defaults with translated message keys", () => {
        const schema = createTranslatedSortedListQuerySchema(["name", "created_at"] as const, {
            messagePrefix: "hotels.validation.list",
            defaults: { sort_by: "created_at", sort_dir: "DESC" },
        });

        expect(schema.parse({})).toEqual({
            page: 1,
            page_size: 25,
            sort_by: "created_at",
            sort_dir: "DESC",
        });
    });
});
