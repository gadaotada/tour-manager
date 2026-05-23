import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { registerControllers } from "./core/controllers/registerControllers";
import { errorMiddleware } from "./core/http/errorMiddleware";
import { requestContextMiddleware } from "./core/http/requestContextMiddleware";
import { healthController } from "./features/health/health.controller";
import { env } from "@libs/config";
import { logger } from "@libs/logger";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestContextMiddleware(logger));

  registerControllers(app, [healthController], { apiPrefix: "/api" });

  if (env.nodeEnv === "production") {
    const clientDist = path.resolve(dirname, "../client");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(errorMiddleware);

  return app;
}
