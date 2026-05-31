import { createServer } from "node:http";

import { wsGateway } from "@core/realtime";
import { createApp } from "./app";
import { authService } from "./features/auth/auth.service";
import { env } from "@libs/config";
import { sessionMiddleware } from "@libs/sessions";

const app = createApp();
const httpServer = createServer(app);

try {
  wsGateway.initialize({
    allowedOrigins: [env.clientOrigin],
    httpServer,
    resolveUser: (userId) => authService.getCurrentUser(userId),
    sessionMiddleware,
  });
} catch (error) {
  console.error("Realtime init failed. Continuing without realtime.", error);
}

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
