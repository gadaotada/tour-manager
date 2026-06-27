const CLIENT_REALTIME_EVENTS = {
    CREATE: "client:create",
    UPDATE: "client:update",
    DELETE: "client:delete",
} as const;

type ClientRealtimeEvent = (typeof CLIENT_REALTIME_EVENTS)[keyof typeof CLIENT_REALTIME_EVENTS];

type ClientRealtimePayload = {
    event: ClientRealtimeEvent;
    data: number;
};

export { CLIENT_REALTIME_EVENTS, type ClientRealtimeEvent, type ClientRealtimePayload };
