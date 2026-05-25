import { createServer } from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app";
import { createRealtime } from "./core/realtime/realtime";
import { env } from "@libs/config";

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true
  }
});

createRealtime(io);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
