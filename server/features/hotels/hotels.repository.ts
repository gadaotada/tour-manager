import { CreateHotel, ListHotelsQuery } from "@tour-manager/shared";

export const hotelsRepository = {
    listHotels: async (params: ListHotelsQuery) => {
        return []
    },
    createHotel: async (params: CreateHotel) => {
        return {
            id: 1,
            name: "Hotel 1",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            country: "USA",
        };
    },

    updateHotel: async (id: number, params: Partial<CreateHotel>) => {
        return {
            id: 1,
            name: "Hotel 1",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            country: "USA",
        };
    },
};
