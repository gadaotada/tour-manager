import { z } from "zod";
import { paginationQuerySchema } from "../common";

export const listHotelsQuerySchema = paginationQuerySchema.extend({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
});

export type ListHotelsQuery = z.infer<typeof listHotelsQuerySchema>;

export const createHotelSchema = z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
    phone: z.string(),
});

export type CreateHotel = z.infer<typeof createHotelSchema>;