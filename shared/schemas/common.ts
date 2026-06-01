import { z } from "zod";

import { schemaInvalidType, schemaMessage } from "../libs/validation";

export const SORT_DIRS = ["ASC", "DESC"] as const;

const PAGINATION_LIMITS = {
    defaultPage: 1,
    defaultPageSize: 25,
    minPageSize: 1,
    maxPageSize: 100,
} as const;

export const idSchema = z.coerce.number().int().positive();

export const versionSchema = z.coerce.number().int().positive();

export const sortDirSchema = z.enum(SORT_DIRS);

const createPaginationQuerySchema = () =>
    z.object({
        page: z.coerce.number().int().positive().default(PAGINATION_LIMITS.defaultPage),
        page_size: z.coerce
            .number()
            .int()
            .min(PAGINATION_LIMITS.minPageSize)
            .max(PAGINATION_LIMITS.maxPageSize)
            .default(PAGINATION_LIMITS.defaultPageSize),
    });

const createTranslatedPaginationQuerySchema = (messagePrefix: string) =>
    z.object({
        page: z.coerce
            .number(schemaInvalidType(`${messagePrefix}.page.int`))
            .int(schemaMessage(`${messagePrefix}.page.int`))
            .positive(schemaMessage(`${messagePrefix}.page.positive`))
            .default(PAGINATION_LIMITS.defaultPage),
        page_size: z.coerce
            .number(schemaInvalidType(`${messagePrefix}.page_size.int`))
            .int(schemaMessage(`${messagePrefix}.page_size.int`))
            .min(PAGINATION_LIMITS.minPageSize, schemaMessage(`${messagePrefix}.page_size.min`))
            .max(PAGINATION_LIMITS.maxPageSize, schemaMessage(`${messagePrefix}.page_size.max`))
            .default(PAGINATION_LIMITS.defaultPageSize),
    });

export const paginationQuerySchema = createPaginationQuerySchema();

export const searchQuerySchema = z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => (value === undefined || value.length === 0 ? undefined : value));

export const idParamsSchema = z.object({
    id: idSchema,
});

export const versionedBodySchema = z.object({
    version: versionSchema,
});

export const createSortedListQuerySchema = <const TSortBy extends readonly [string, ...string[]]>(
    sortByCols: TSortBy,
    defaults?: {
        sort_by?: TSortBy[number];
        sort_dir?: (typeof SORT_DIRS)[number];
    },
) =>
    createPaginationQuerySchema().extend({
        sort_by: z.enum(sortByCols).default(defaults?.sort_by ?? sortByCols[0]),
        sort_dir: sortDirSchema.default(defaults?.sort_dir ?? "DESC"),
    });

export const createTranslatedSortedListQuerySchema = <const TSortBy extends readonly [string, ...string[]]>(
    sortByCols: TSortBy,
    options: {
        messagePrefix: string;
        defaults?: {
            sort_by?: TSortBy[number];
            sort_dir?: (typeof SORT_DIRS)[number];
        };
    },
) =>
    createTranslatedPaginationQuerySchema(options.messagePrefix).extend({
        sort_by: z
            .enum(sortByCols, schemaMessage(`${options.messagePrefix}.sort_by`))
            .default(options.defaults?.sort_by ?? sortByCols[0]),
        sort_dir: z
            .enum(SORT_DIRS, schemaMessage(`${options.messagePrefix}.sort_dir`))
            .default(options.defaults?.sort_dir ?? "DESC"),
    });

export type SortDir = z.infer<typeof sortDirSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParams = z.infer<typeof idParamsSchema>;
export type VersionedBody = z.infer<typeof versionedBodySchema>;
