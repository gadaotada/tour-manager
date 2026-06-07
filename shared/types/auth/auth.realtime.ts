const AUTH_REALTIME_EVENTS = {
  SESSION_CHANGE: "auth:session-change",
} as const;

type AuthRealtimeEvent = (typeof AUTH_REALTIME_EVENTS)[keyof typeof AUTH_REALTIME_EVENTS];

type AuthRealtimePayload = {
  event: AuthRealtimeEvent;
  data: {
    reason: "permissions_changed";
  };
};

export { AUTH_REALTIME_EVENTS, type AuthRealtimeEvent, type AuthRealtimePayload };