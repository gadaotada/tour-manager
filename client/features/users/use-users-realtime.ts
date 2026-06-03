import { useEffect, useRef } from "react";

import { USER_REALTIME_EVENTS } from "@tour-manager/shared";

import { subscribeRealtimeEvent, useRealtimeScope } from "@libs/realtime";

function useUsersRealtime(onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useRealtimeScope("users");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const unsubscribe = Object.values(USER_REALTIME_EVENTS).map((event) =>
      subscribeRealtimeEvent(event, () => onChangeRef.current()),
    );

    return () => {
      unsubscribe.forEach((off) => off());
    };
  }, []);
}

export { useUsersRealtime };
