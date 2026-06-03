import { useEffect, useRef } from "react";

import { HOTEL_REALTIME_EVENTS } from "@tour-manager/shared";

import { subscribeRealtimeEvent } from "@libs/realtime";

function useHotelsRealtime(onChange: () => void) {
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const unsubscribe = Object.values(HOTEL_REALTIME_EVENTS).map((event) =>
            subscribeRealtimeEvent(event, () => onChangeRef.current()),
        );

        return () => {
            unsubscribe.forEach((off) => off());
        };
    }, []);
}

export { useHotelsRealtime };
