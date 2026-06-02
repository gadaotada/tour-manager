import type {
    CreateHotelInput,
    Hotel,
    HotelsListResult,
    ListHotelsQuery,
    UpdateHotelInput,
    UpdateHotelStatusInput,
} from "@tour-manager/shared";

import { api } from "@libs/api";

function toListParams(query: ListHotelsQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
        page: query.page,
        page_size: query.page_size,
        sort_by: query.sort_by,
        sort_dir: query.sort_dir,
    };

    if (query.search) {
        params.search = query.search;
    }

    if (query.stars !== undefined) {
        params.stars = query.stars;
    }

    if (query.is_active !== undefined) {
        params.is_active = query.is_active ? 1 : 0;
    }

    return params;
}

async function listHotels(query: ListHotelsQuery): Promise<HotelsListResult> {
    return api.json.get<HotelsListResult>("/api/hotels/list", {
        params: toListParams(query),
    });
}

async function createHotel(input: CreateHotelInput): Promise<Hotel> {
    return api.json.post<Hotel>("/api/hotels/create", input);
}

async function updateHotel(input: UpdateHotelInput): Promise<void> {
    await api.json.put<true>("/api/hotels/update", input);
}

async function updateHotelStatus(
    hotelId: number,
    input: UpdateHotelStatusInput,
): Promise<void> {
    await api.json.put<true>(`/api/hotels/update-status/${hotelId}`, input);
}

async function deleteHotel(hotelId: number): Promise<void> {
    await api.json.delete<null>(`/api/hotels/delete/${hotelId}`);
}

export { createHotel, deleteHotel, listHotels, updateHotel, updateHotelStatus };
