import { CreateHotel, REALTIME_SCOPES, type ListHotelsQuery } from "@tour-manager/shared";
import { hotelsRepository } from "./hotels.repository";
import { wsGateway } from "@core/realtime";


const hotelsService = {
    createHotel: async (params: CreateHotel, originSocketId?: string) => {
        const hotel = await hotelsRepository.createHotel(params);

        wsGateway.emitToScope("global", {
            type: "hotel.created",
            occurredAt: new Date().toISOString(),
            data: hotel,
        }, { excludeSocketId: originSocketId });

        return hotel;
    },
    getHotels: async (params: ListHotelsQuery) => {
        const hotels = await hotelsRepository.listHotels(params);
        return hotels;
    },

    updateHotel: async (id: number, params: Partial<CreateHotel>, originSocketId?: string) => {
        const hotel = await hotelsRepository.updateHotel(id, params);
        // TODO: Handle errors - dublicates, 404, etc.

        wsGateway.emitToScope("global", {
            type: "hotel.updated",
            occurredAt: new Date().toISOString(),
            data: hotel,
        }, { excludeSocketId: originSocketId });

        return hotel;
    },
}

export { hotelsService };