const HOTEL_REALTIME_EVENTS = {
    CREATE: "hotel:create",
    UPDATE: "hotel:update",
    STATUS_CHANGE: "hotel:status-change",
    DELETE: "hotel:delete",
} as const;

type HotelRealtimeEvent = (typeof HOTEL_REALTIME_EVENTS)[keyof typeof HOTEL_REALTIME_EVENTS];

type HotelRealtimePayload = {
    event: HotelRealtimeEvent;
    data: number;
};

export { HOTEL_REALTIME_EVENTS, type HotelRealtimeEvent, type HotelRealtimePayload };
