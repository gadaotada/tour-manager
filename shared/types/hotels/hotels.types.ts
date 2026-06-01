import type { z } from "zod";
import type {
    createHotelSchema,
    hotelCoreSchema,
    hotelIdParamsSchema,
    hotelRecordSchema,
    listHotelsQuerySchema,
    updateHotelSchema,
    updateHotelStatusSchema,
} from "../../schemas/hotels";
import type { PaginatedResult } from "../pagination";

type CreateHotelInput = z.infer<typeof createHotelSchema>;
type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
type ListHotelsQuery = z.infer<typeof listHotelsQuerySchema>;
type UpdateHotelStatusInput = z.infer<typeof updateHotelStatusSchema>;
type HotelIdParams = z.infer<typeof hotelIdParamsSchema>;

type HotelCore = z.infer<typeof hotelCoreSchema>;
type HotelRecord = z.infer<typeof hotelRecordSchema>;

type Hotel = HotelCore &
    HotelRecord & {
        created_at: string;
        updated_at: string;
    };

type ChangeHotelStatusInput = Pick<UpdateHotelInput, "id" | "version" | "is_active">;

type HotelsListQuery = Pick<ListHotelsQuery, "search" | "stars" | "is_active" | "sort_by" | "sort_dir">;

type HotelsListResult = PaginatedResult<Hotel[], HotelsListQuery>;

export type {
    ChangeHotelStatusInput,
    CreateHotelInput,
    Hotel,
    HotelCore,
    HotelIdParams,
    HotelRecord,
    HotelsListQuery,
    HotelsListResult,
    ListHotelsQuery,
    UpdateHotelInput,
    UpdateHotelStatusInput,
};
