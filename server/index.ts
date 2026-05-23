import { createServer } from "node:http";

import { Server } from "socket.io";

import { createApp } from "./app";
import { env } from "./core/config/env";
import { createRealtime } from "./core/realtime/realtime";

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
