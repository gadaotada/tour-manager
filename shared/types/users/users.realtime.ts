const USER_REALTIME_EVENTS = {
  CREATE: "user:create",
  UPDATE: "user:update",
  STATUS_CHANGE: "user:status-change",
  DELETE: "user:delete",
} as const;

type UserRealtimeEvent = (typeof USER_REALTIME_EVENTS)[keyof typeof USER_REALTIME_EVENTS];

type UserRealtimePayload = {
  event: UserRealtimeEvent;
  data: {
    id: string;
  };
};

export { USER_REALTIME_EVENTS, type UserRealtimeEvent, type UserRealtimePayload };
