import { useEffect, useRef } from "react";

import { CLIENT_REALTIME_EVENTS } from "@tour-manager/shared";

import { subscribeRealtimeEvent } from "@libs/realtime";

function useClientsRealtime(onChange: () => void) {
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const unsubscribe = Object.values(CLIENT_REALTIME_EVENTS).map((event) =>
            subscribeRealtimeEvent(event, () => onChangeRef.current()),
        );

        return () => {
            unsubscribe.forEach((off) => off());
        };
    }, []);
}

export { useClientsRealtime };
