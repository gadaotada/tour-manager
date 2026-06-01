import { randomUUID } from "node:crypto";
import type { IncomingMessage, Server } from "node:http";

import type { ClientUser } from "@tour-manager/shared";
import {
  REALTIME_HEARTBEAT_INTERVAL_MS,
  REALTIME_SCOPES,
  REALTIME_URL_PARSE_BASE,
  REALTIME_WS_PATH,
  realtimeClientMessageSchema,
  realtimeConnectedMessageSchema,
  realtimeScopeSchema,
  type RealtimeScope,
} from "@tour-manager/shared";
import type { RequestHandler } from "express";
import type { SessionData } from "express-session";
import { WebSocket, WebSocketServer, type RawData } from "ws";

type SessionRequest = IncomingMessage & {
  session?: SessionData;
};

type RealtimeUserResolver = (userId: string) => Promise<ClientUser | null>;

type RealtimeGatewayOptions = {
  allowedOrigins: readonly string[];
  httpServer: Server;
  resolveUser: RealtimeUserResolver;
  sessionMiddleware: RequestHandler;
};

type SocketMeta = {
  isAlive: boolean;
  socket_id: string;
  user: ClientUser;
};

const GLOBAL_SCOPE: RealtimeScope = "global";

class RealtimeGateway {
  private allowedOrigins: readonly string[] = [];
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private initialized = false;
  private readonly metaBySocket = new Map<WebSocket, SocketMeta>();
  private resolveUser: RealtimeUserResolver | null = null;
  private readonly scopesBySocket = new Map<WebSocket, Set<RealtimeScope>>();
  private readonly socketsByScope = new Map<RealtimeScope, Set<WebSocket>>();
  private wss: WebSocketServer | null = null;

  emitToScope(scope: RealtimeScope, event: unknown, options?: { exclude_socket_id: string | undefined }): void {
    const parsedScope = realtimeScopeSchema.safeParse(scope);
    if (!parsedScope.success) {
      return;
    }

    const sockets = this.socketsByScope.get(parsedScope.data);
    if (!sockets || sockets.size === 0) {
      return;
    }

    for (const socket of sockets) {
      if (options?.exclude_socket_id && options.exclude_socket_id !== undefined) {
        const meta = this.metaBySocket.get(socket);
        if (meta?.socket_id === options.exclude_socket_id) {
          continue;
        }
      }

      this.sendJson(socket, event);
    }
  }

  emitToUser(userId: string, event: unknown, options?: { exclude_socket_id?: string }): void {
    for (const [socket, meta] of this.metaBySocket) {
      if (meta.user.id !== userId) {
        continue;
      }

      if (options?.exclude_socket_id && meta.socket_id === options.exclude_socket_id) {
        continue;
      }

      this.sendJson(socket, event);
    }
  }

  initialize(options: RealtimeGatewayOptions): void {
    if (this.initialized) {
      return;
    }

    this.allowedOrigins = options.allowedOrigins;
    this.resolveUser = options.resolveUser;
    this.wss = new WebSocketServer({ noServer: true });
    this.initialized = true;
    this.startHeartbeat();

    this.wss.on("error", () => {
      // Keep WS layer resilient; individual socket lifecycle handles cleanup.
    });

    this.wss.on("connection", (socket, req) => {
      const user = (req as IncomingMessage & { realtimeUser?: ClientUser }).realtimeUser;
      if (!user) {
        socket.close(1008, "Unauthorized");
        return;
      }

      const socket_id = randomUUID();
      this.metaBySocket.set(socket, { socket_id, user, isAlive: true });
      this.joinScope(socket, GLOBAL_SCOPE);
      const connectedMessage = realtimeConnectedMessageSchema.parse({
        type: "realtime.connected",
        user_id: user.id,
        socket_id,
        scopes: [GLOBAL_SCOPE],
      });
      this.sendJson(socket, connectedMessage);

      socket.on("message", (rawData) => {
        this.handleIncomingMessage(socket, rawData);
      });

      socket.on("pong", () => {
        const meta = this.metaBySocket.get(socket);
        if (!meta) {
          return;
        }

        meta.isAlive = true;
      });

      socket.on("error", () => {
        this.removeSocket(socket);
      });

      socket.on("close", () => {
        this.removeSocket(socket);
      });
    });

    options.httpServer.on("upgrade", (req, socket, head) => {
      if (!this.isUpgradePath(req.url)) {
        socket.destroy();
        return;
      }

      if (!this.isOriginAllowed(req)) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }

      options.sessionMiddleware(req as never, {} as never, (error?: unknown) => {
        if (error) {
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
          socket.destroy();
          return;
        }

        const sessionRequest = req as SessionRequest;
        const user_id = sessionRequest.session?.user_id;

        if (!user_id || !this.resolveUser) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        this.resolveUser(user_id)
          .then((user) => {
            if (!user) {
              socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
              socket.destroy();
              return;
            }

            (req as IncomingMessage & { realtimeUser?: ClientUser }).realtimeUser = user;

            try {
              this.wss?.handleUpgrade(req, socket, head, (ws) => {
                this.wss?.emit("connection", ws, req);
              });
            } catch {
              socket.destroy();
            }
          })
          .catch(() => {
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
          });
      });
    });

    options.httpServer.on("close", () => {
      if (!this.heartbeatTimer) {
        return;
      }

      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    });
  }

  private clearSocketScopes(socket: WebSocket): void {
    const socketScopes = this.scopesBySocket.get(socket);
    if (!socketScopes) {
      return;
    }

    for (const scope of socketScopes) {
      const sockets = this.socketsByScope.get(scope);
      if (!sockets) {
        continue;
      }

      sockets.delete(socket);
      if (sockets.size === 0) {
        this.socketsByScope.delete(scope);
      }
    }

    this.scopesBySocket.delete(socket);
  }

  private handleIncomingMessage(socket: WebSocket, rawData: RawData): void {
    const messageText = this.toMessageText(rawData);
    if (!messageText) {
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(messageText);
    } catch {
      return;
    }

    const parsed = realtimeClientMessageSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    const message = parsed.data;
    if (message.type === "presence.join") {
      this.joinScope(socket, message.scope);
      return;
    }

    if (message.scope === GLOBAL_SCOPE) {
      return;
    }

    this.leaveScope(socket, message.scope);
  }

  private isOriginAllowed(req: IncomingMessage): boolean {
    const origin = req.headers.origin;
    if (!origin) {
      return true;
    }

    return this.allowedOrigins.includes(origin);
  }

  private isUpgradePath(rawUrl: string | undefined): boolean {
    if (!rawUrl) {
      return false;
    }

    try {
      const parsed = new URL(rawUrl, REALTIME_URL_PARSE_BASE);
      return parsed.pathname === REALTIME_WS_PATH;
    } catch {
      return false;
    }
  }

  private joinScope(socket: WebSocket, scope: RealtimeScope): void {
    if (!REALTIME_SCOPES.includes(scope)) {
      return;
    }

    const socketScopes = this.scopesBySocket.get(socket) ?? new Set<RealtimeScope>();
    if (socketScopes.has(scope)) {
      return;
    }

    socketScopes.add(scope);
    this.scopesBySocket.set(socket, socketScopes);

    const sockets = this.socketsByScope.get(scope) ?? new Set<WebSocket>();
    sockets.add(socket);
    this.socketsByScope.set(scope, sockets);
  }

  private leaveScope(socket: WebSocket, scope: RealtimeScope): void {
    const socketScopes = this.scopesBySocket.get(socket);
    if (!socketScopes || !socketScopes.has(scope)) {
      return;
    }

    socketScopes.delete(scope);
    if (socketScopes.size === 0) {
      this.scopesBySocket.delete(socket);
    }

    const sockets = this.socketsByScope.get(scope);
    if (!sockets) {
      return;
    }

    sockets.delete(socket);
    if (sockets.size === 0) {
      this.socketsByScope.delete(scope);
    }
  }

  private removeSocket(socket: WebSocket): void {
    this.clearSocketScopes(socket);
    this.metaBySocket.delete(socket);
  }

  private sendJson(socket: WebSocket, payload: unknown): void {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      socket.send(JSON.stringify(payload));
    } catch {
      // Ignore single socket delivery errors.
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      return;
    }

    this.heartbeatTimer = setInterval(() => {
      for (const [socket, meta] of this.metaBySocket) {
        if (!meta.isAlive) {
          this.removeSocket(socket);
          try {
            socket.terminate();
          } catch {
            // Ignore single socket termination errors.
          }
          continue;
        }

        meta.isAlive = false;
        try {
          socket.ping();
        } catch {
          this.removeSocket(socket);
          try {
            socket.terminate();
          } catch {
            // Ignore single socket termination errors.
          }
        }
      }
    }, REALTIME_HEARTBEAT_INTERVAL_MS);

    this.heartbeatTimer.unref();
  }

  private toMessageText(rawData: RawData): string | null {
    if (typeof rawData === "string") {
      return rawData;
    }

    if (rawData instanceof ArrayBuffer) {
      return Buffer.from(rawData).toString("utf-8");
    }

    if (Array.isArray(rawData)) {
      return Buffer.concat(rawData).toString("utf-8");
    }

    return rawData.toString("utf-8");
  }
}

const wsGateway = new RealtimeGateway();

export { wsGateway, type RealtimeGatewayOptions, type RealtimeUserResolver };
