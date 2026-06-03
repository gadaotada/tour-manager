import { useEffect } from "react";

import {
  setRealtimeRouteScope,
  subscribeRealtimeEvent,
  type RouteRealtimeScope,
} from "./realtime";

type EventHandler<TPayload> = {
  bivarianceHack(payload: TPayload): void;
}["bivarianceHack"];
type RealtimePayloadParser<TPayload> = (payload: unknown) => TPayload | null;

type RealtimeEventBinding<TPayload = unknown> = {
  eventType: string;
  handler: EventHandler<TPayload>;
  parse?: RealtimePayloadParser<TPayload>;
};

function useRealtimeScope(scope: RouteRealtimeScope | null): void {
  useEffect(() => {
    setRealtimeRouteScope(scope);

    return () => {
      setRealtimeRouteScope(null);
    };
  }, [scope]);
}

function useRealtimeEvents<TEvents extends readonly RealtimeEventBinding<unknown>[]>(
  events: TEvents,
): void {
  useEffect(() => {
    const unsubscribers = events.map((event) =>
      subscribeRealtimeEvent(event.eventType, (payload) => {
        if (!event.parse) {
          event.handler(payload);
          return;
        }

        const parsed = event.parse(payload);
        if (parsed === null) {
          return;
        }

        event.handler(parsed);
      }),
    );

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [events]);
}

export { useRealtimeEvents, useRealtimeScope, type RealtimeEventBinding };
