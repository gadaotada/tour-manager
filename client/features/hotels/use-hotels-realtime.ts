import { useEffect } from "react";

import { HOTEL_REALTIME_EVENTS } from "@tour-manager/shared";

import { realtimeClient, subscribeRealtimeEvent } from "@libs/realtime";

function useHotelsRealtime(onChange: () => void) {
    useEffect(() => {
        realtimeClient.setRouteScope("hotels");

        const unsubscribe = Object.values(HOTEL_REALTIME_EVENTS).map((event) =>
            subscribeRealtimeEvent(event, onChange),
        );

        return () => {
            realtimeClient.setRouteScope(null);
            unsubscribe.forEach((off) => off());
        };
    }, [onChange]);
}

export { useHotelsRealtime };
