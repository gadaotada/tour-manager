import { z } from "zod";

import { schemaInvalidType, schemaMessage } from "../../libs/validation";
import { createTranslatedSortedListQuerySchema } from "../common";

export const CLIENT_SORT_BY_COLS = ["name", "created_at", "updated_at"] as const;

const clientIdSchema = z.coerce
    .number(schemaInvalidType("clients.validation.id.int"))
    .int(schemaMessage("clients.validation.id.int"))
    .positive(schemaMessage("clients.validation.id.positive"));

const clientVersionSchema = z.coerce
    .number(schemaInvalidType("clients.validation.version.int"))
    .int(schemaMessage("clients.validation.version.int"))
    .positive(schemaMessage("clients.validation.version.positive"));

const EGN_WEIGHTS = [2, 4, 8, 5, 10, 9, 7, 3, 6] as const;
const LNCH_WEIGHTS = [21, 19, 17, 13, 11, 9, 7, 3, 1] as const;

const clientSearchQuerySchema = z
    .string()
    .trim()
    .max(255, schemaMessage("clients.validation.search.max"))
    .optional()
    .transform((value) => (value === undefined || value.length === 0 ? undefined : value));

const nullableTextSchema = (max: number, messageKey: string) =>
    z
        .string()
        .trim()
        .max(max, schemaMessage(messageKey))
        .transform((value) => (value.length === 0 ? null : value));

const nullableEmailSchema = z
    .string()
    .trim()
    .max(254, schemaMessage("clients.validation.email.max"))
    .refine((value) => value.length === 0 || z.string().email().safeParse(value).success, {
        message: "clients.validation.email.email",
    })
    .transform((value) => (value.length === 0 ? null : value));

function hasValidChecksum(value: string, weights: readonly number[]): boolean {
    const digits = [...value].map(Number);
    const checksum =
        weights.reduce((sum, weight, index) => sum + weight * (digits[index] ?? 0), 0) % 11;
    const normalizedChecksum = checksum === 10 ? 0 : checksum;

    return normalizedChecksum === digits[9];
}

function isValidEgnDate(value: string): boolean {
    const year = Number(value.slice(0, 2));
    const encodedMonth = Number(value.slice(2, 4));
    const day = Number(value.slice(4, 6));
    const century =
        encodedMonth >= 1 && encodedMonth <= 12
            ? 1900
            : encodedMonth >= 21 && encodedMonth <= 32
              ? 1800
              : encodedMonth >= 41 && encodedMonth <= 52
                ? 2000
                : null;

    if (century === null) return false;

    const month =
        encodedMonth > 40
            ? encodedMonth - 40
            : encodedMonth > 20
              ? encodedMonth - 20
              : encodedMonth;
    const fullYear = century + year;
    const date = new Date(Date.UTC(fullYear, month - 1, day));

    return (
        date.getUTCFullYear() === fullYear &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function isValidEgn(value: string): boolean {
    return isValidEgnDate(value) && hasValidChecksum(value, EGN_WEIGHTS);
}

function isValidLnch(value: string): boolean {
    return hasValidChecksum(value, LNCH_WEIGHTS);
}

function isValidClientIdentifier(value: string): boolean {
    return /^\d{10}$/.test(value) && (isValidEgn(value) || isValidLnch(value));
}

export const clientCoreSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, schemaMessage("clients.validation.name.min"))
        .max(160, schemaMessage("clients.validation.name.max")),
    egn: z
        .string()
        .trim()
        .length(10, schemaMessage("clients.validation.egn.length"))
        .refine(isValidClientIdentifier, schemaMessage("clients.validation.egn.invalid")),
    address: nullableTextSchema(500, "clients.validation.address.max"),
    phone_number: nullableTextSchema(20, "clients.validation.phone_number.max"),
    email: nullableEmailSchema,
});

export const clientRecordSchema = z.object({
    id: clientIdSchema,
    version: clientVersionSchema,
});

export const createClientSchema = clientCoreSchema;

export const updateClientSchema = clientCoreSchema.merge(clientRecordSchema);

export const clientIdParamsSchema = z.object({
    id: clientIdSchema,
});

export const listClientsQuerySchema = createTranslatedSortedListQuerySchema(CLIENT_SORT_BY_COLS, {
    messagePrefix: "clients.validation.list",
    defaults: { sort_by: "created_at", sort_dir: "DESC" },
}).extend({
    search: clientSearchQuerySchema,
});
