import {
  REALTIME_WS_PATH,
  realtimeConnectedMessageSchema,
  type RealtimeClientMessage,
  type RealtimeScope,
} from "@tour-manager/shared";

const GLOBAL_SCOPE: RealtimeScope = "global";

type RouteRealtimeScope = Exclude<RealtimeScope, "global">;
type RealtimeConnectionState = "idle" | "connecting" | "open" | "closed";
type RealtimeListener = (payload: unknown) => void;
type RealtimeMessage = { type: string } & Record<string, unknown>;

class RealtimeClient {
  private readonly listenersByType = new Map<string, Set<RealtimeListener>>();
  private pendingMessages: RealtimeClientMessage[] = [];
  private routeScope: RouteRealtimeScope | null = null;
  private socket: WebSocket | null = null;
  private socket_id: string | null = null;
  private state: RealtimeConnectionState = "idle";

  connect(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const socket = new WebSocket(this.resolveWebSocketUrl());
    this.socket = socket;
    this.state = "connecting";

    socket.onopen = () => {
      this.state = "open";
      this.flushPendingMessages();
    };

    socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
        this.socket_id = null;
        this.state = "closed";
      }
    };

    socket.onerror = () => {
      this.state = "closed";
    };
  }

  disconnect(): void {
    this.pendingMessages = [];
    this.routeScope = null;
    this.socket_id = null;

    if (!this.socket) {
      this.state = "closed";
      return;
    }

    this.socket.close(1000, "Client logout");
    this.socket = null;
    this.state = "closed";
  }

  getSocketId(): string | null {
    return this.socket_id;
  }

  joinScope(scope: RouteRealtimeScope): void {
    this.send({ type: "presence.join", scope });
  }

  leaveScope(scope: RouteRealtimeScope): void {
    this.send({ type: "presence.leave", scope });
  }

  on(eventType: string, listener: RealtimeListener): () => void {
    const listeners = this.listenersByType.get(eventType) ?? new Set<RealtimeListener>();
    listeners.add(listener);
    this.listenersByType.set(eventType, listeners);

    return () => {
      const current = this.listenersByType.get(eventType);
      if (!current) {
        return;
      }

      current.delete(listener);
      if (current.size === 0) {
        this.listenersByType.delete(eventType);
      }
    };
  }

  setRouteScope(scope: RouteRealtimeScope | null): void {
    const previousScope = this.routeScope;
    if (previousScope === scope) {
      return;
    }

    this.routeScope = scope;

    if (previousScope) {
      this.leaveScope(previousScope);
    }

    if (scope) {
      this.joinScope(scope);
    }
  }

  private flushPendingMessages(): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (this.pendingMessages.length === 0) {
      return;
    }

    for (const message of this.pendingMessages) {
      socket.send(JSON.stringify(message));
    }

    this.pendingMessages = [];
  }

  private handleMessage(rawData: unknown): void {
    if (typeof rawData !== "string") {
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawData);
    } catch {
      return;
    }

    const message = payload as Partial<RealtimeMessage> & { event?: string };
    const eventType =
      typeof message.type === "string"
        ? message.type
        : typeof message.event === "string"
          ? message.event
          : undefined;

    if (!eventType) {
      return;
    }

    if (eventType === "realtime.connected") {
      const parsed = realtimeConnectedMessageSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.scopes.includes(GLOBAL_SCOPE)) {
        return;
      }

      this.socket_id = parsed.data.socket_id;
    }

    const listeners = this.listenersByType.get(eventType);
    if (!listeners || listeners.size === 0) {
      return;
    }

    for (const listener of listeners) {
      listener(payload);
    }
  }

  private resolveWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${REALTIME_WS_PATH}`;
  }

  private send(message: RealtimeClientMessage): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      this.pendingMessages.push(message);
      this.connect();
      return;
    }

    socket.send(JSON.stringify(message));
  }
}

const realtimeClient = new RealtimeClient();

function disconnectRealtime(): void {
  realtimeClient.disconnect();
}

function ensureRealtimeConnection(): void {
  realtimeClient.connect();
}

function getRealtimeSocketId(): string | null {
  return realtimeClient.getSocketId();
}

function subscribeRealtimeEvent(
  eventType: string,
  listener: RealtimeListener,
): () => void {
  return realtimeClient.on(eventType, listener);
}

export {
  disconnectRealtime,
  ensureRealtimeConnection,
  getRealtimeSocketId,
  realtimeClient,
  subscribeRealtimeEvent,
};
