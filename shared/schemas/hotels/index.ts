import { z } from "zod";

import { schemaBoolean, schemaInvalidType, schemaMessage } from "../../libs/validation";
import { createTranslatedSortedListQuerySchema } from "../common";

export const HOTEL_SORT_BY_COLS = [
    "name",
    "address",
    "stars",
    "is_active",
    "created_at",
    "updated_at",
] as const;

const hotelIdSchema = z.coerce
    .number(schemaInvalidType("hotels.validation.id.int"))
    .int(schemaMessage("hotels.validation.id.int"))
    .positive(schemaMessage("hotels.validation.id.positive"));

const hotelVersionSchema = z.coerce
    .number(schemaInvalidType("hotels.validation.version.int"))
    .int(schemaMessage("hotels.validation.version.int"))
    .positive(schemaMessage("hotels.validation.version.positive"));

const hotelSearchQuerySchema = z
    .string()
    .trim()
    .max(255, schemaMessage("hotels.validation.search.max"))
    .optional()
    .transform((value) => (value === undefined || value.length === 0 ? undefined : value));

export const hotelCoreSchema = z.object({
    name: z
        .string()
        .min(3, schemaMessage("hotels.validation.name.min"))
        .max(100, schemaMessage("hotels.validation.name.max")),
    address: z
        .string()
        .min(5, schemaMessage("hotels.validation.address.min"))
        .max(255, schemaMessage("hotels.validation.address.max")),
    stars: z
        .number(schemaInvalidType("hotels.validation.stars.type"))
        .min(0, schemaMessage("hotels.validation.stars.min"))
        .max(6, schemaMessage("hotels.validation.stars.max")),
});

export const hotelRecordSchema = z.object({
    id: hotelIdSchema,
    version: hotelVersionSchema,
    is_active: z.boolean(schemaBoolean("hotels.validation.is_active.invalid")),
});

export const createHotelSchema = hotelCoreSchema;

export const updateHotelSchema = hotelCoreSchema.merge(hotelRecordSchema);

export const updateHotelStatusSchema = z.object({
    version: hotelVersionSchema,
    is_active: z.boolean(schemaBoolean("hotels.validation.is_active.invalid")),
});

export const hotelIdParamsSchema = z.object({
    id: hotelIdSchema,
});

export const listHotelsQuerySchema = createTranslatedSortedListQuerySchema(HOTEL_SORT_BY_COLS, {
    messagePrefix: "hotels.validation.list",
    defaults: { sort_by: "created_at", sort_dir: "DESC" },
}).extend({
    search: hotelSearchQuerySchema,
    stars: z.coerce
        .number(schemaInvalidType("hotels.validation.filter.stars.int"))
        .int(schemaMessage("hotels.validation.filter.stars.int"))
        .min(0, schemaMessage("hotels.validation.filter.stars.min"))
        .max(6, schemaMessage("hotels.validation.filter.stars.max"))
        .optional(),
    is_active: z.coerce
        .number(schemaInvalidType("hotels.validation.filter.is_active.int"))
        .int(schemaMessage("hotels.validation.filter.is_active.int"))
        .min(0, schemaMessage("hotels.validation.filter.is_active.min"))
        .max(1, schemaMessage("hotels.validation.filter.is_active.max"))
        .optional()
        .transform((value) => (value === undefined ? undefined : value === 1)),
});
