import { wsGateway } from "@core/realtime";
import { buildPaginatedResult, DB_ERROR_CODES, DB_ERROR_MESSAGE_KEYS, DbError } from "@libs/db";
import {
    HOTEL_REALTIME_EVENTS,
    type ChangeHotelStatusInput,
    type CreateHotelInput,
    type Hotel,
    type HotelRealtimePayload,
    type ListHotelsQuery,
    type UpdateHotelInput,
} from "@tour-manager/shared";

import { hotelsRepository } from "./hotels.repository";

function emitHotelEvent(
    event: HotelRealtimePayload["event"],
    data: number,
    exclude_socket_id: string | undefined,
) {
    const payload: HotelRealtimePayload = { event, data };
    wsGateway.emitToScope("hotels", payload, { exclude_socket_id });
}

const hotelsService = {
    getHotels: async (payload: ListHotelsQuery) => {
        const { rows, total } = await hotelsRepository.listHotels(payload);

        return buildPaginatedResult({
            page: payload.page,
            page_size: payload.page_size,
            total,
            data: rows,
            query: {
                search: payload.search,
                stars: payload.stars,
                is_active: payload.is_active,
                sort_by: payload.sort_by,
                sort_dir: payload.sort_dir,
            },
        });
    },

    createHotel: async (payload: CreateHotelInput, exclude_socket_id: string | undefined): Promise<Hotel> => {
        const mutation = await hotelsRepository.createHotel(payload);

        if (!mutation.ok) throw new DbError(mutation.error);

        const createdRow = mutation.rows?.[0];

        if (!createdRow) {
            throw new DbError({
                statusCode: 500,
                code: DB_ERROR_CODES.GENERAL_DB_ERROR,
                messageKey: DB_ERROR_MESSAGE_KEYS.GENERAL_DB_ERROR,
                safeMessage: "Database operation failed.",
                cause: null,
            });
        }

        emitHotelEvent(HOTEL_REALTIME_EVENTS.CREATE, createdRow.id, exclude_socket_id);

        return createdRow;
    },

    updateHotel: async (payload: UpdateHotelInput, exclude_socket_id: string | undefined) => {
        await hotelsRepository.updateHotel(payload);
        emitHotelEvent(HOTEL_REALTIME_EVENTS.UPDATE, payload.id, exclude_socket_id);
    },

    changeHotelStatus: async (payload: ChangeHotelStatusInput, exclude_socket_id: string | undefined) => {
        await hotelsRepository.updateHotel(payload);
        emitHotelEvent(HOTEL_REALTIME_EVENTS.STATUS_CHANGE, payload.id, exclude_socket_id);
    },

    deleteHotel: async (hotelId: number, exclude_socket_id: string | undefined) => {
        await hotelsRepository.deleteHotel(hotelId);
        emitHotelEvent(HOTEL_REALTIME_EVENTS.DELETE, hotelId, exclude_socket_id);
    },
};

export { hotelsService };
