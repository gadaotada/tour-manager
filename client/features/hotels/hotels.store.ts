import { create } from "zustand";

import type { Hotel, HotelsListQuery, HotelsListResult } from "@tour-manager/shared";

type HotelsStore = {
  result: HotelsListResult | null;
  setResult: (result: HotelsListResult) => void;
  upsertHotel: (hotel: Hotel) => void;
  removeHotel: (hotelId: number) => void;
};

const EMPTY_HOTELS: Hotel[] = [];

const hotelsStore = create<HotelsStore>((set) => ({
  result: null,
  removeHotel: (hotelId) =>
    set((state) => {
      if (!state.result) return state;

      return {
        result: {
          ...state.result,
          data: state.result.data.filter((hotel) => hotel.id !== hotelId),
          total: Math.max(0, state.result.total - 1),
        },
      };
    }),
  setResult: (result) => set({ result }),
  upsertHotel: (hotel) =>
    set((state) => {
      if (!state.result) return state;

      const existingIndex = state.result.data.findIndex((item) => item.id === hotel.id);
      const nextData =
        existingIndex === -1
          ? [hotel, ...state.result.data]
          : state.result.data.map((item) => (item.id === hotel.id ? hotel : item));

      return {
        result: {
          ...state.result,
          data: nextData,
        },
      };
    }),
}));

const useHotelsRows = () => hotelsStore((state) => state.result?.data ?? EMPTY_HOTELS);
const useHotelsPagination = () => hotelsStore((state) => state.result);
const useHotelsSort = () =>
  hotelsStore((state): HotelsListQuery | null => state.result?.query ?? null);

export {
  hotelsStore,
  useHotelsPagination,
  useHotelsRows,
  useHotelsSort,
};
