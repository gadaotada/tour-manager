import { useEffect, useRef } from "react";

import { HOTEL_REALTIME_EVENTS } from "@tour-manager/shared";

import { realtimeClient, subscribeRealtimeEvent } from "@libs/realtime";

function useHotelsRealtime(onChange: () => void) {
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        realtimeClient.setRouteScope("hotels");

        const unsubscribe = Object.values(HOTEL_REALTIME_EVENTS).map((event) =>
            subscribeRealtimeEvent(event, () => onChangeRef.current()),
        );

        return () => {
            realtimeClient.setRouteScope(null);
            unsubscribe.forEach((off) => off());
        };
    }, []);
}

export { useHotelsRealtime };
