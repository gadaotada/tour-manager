import type { Server } from "socket.io";

export function createRealtime(io: Server): void {
  io.on("connection", (socket) => {
    socket.emit("connected", { socketId: socket.id });
  });
}
