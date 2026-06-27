import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { registerControllers } from "@core/controllers";
import { errorMiddleware, requestContextMiddleware } from "@core/http";
import { clientVersionMiddleware, loadClientVersion } from "@core/versioning";
import { auditController } from "@features/audit";
import { authController } from "@features/auth";
import { healthController } from "@features/health/health.controller";
import { hotelsController } from "@features/hotels/hotels.controller";
import { clientsController } from "@features/clients/clients.controller";
import { settingsUserController } from "@features/settings";
import { usersController } from "@features/users";
import { env } from "@libs/config";
import { logger } from "@libs/logger";
import { sessionMiddleware } from "@libs/sessions";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): Express {
  const app = express();
  const clientDist = path.resolve(dirname, "../client");
  const clientPublic = path.resolve(dirname, "../client/public");
  const clientVersion = loadClientVersion({
    clientDistPath: clientDist,
    clientPublicPath: clientPublic,
    envBuildId: env.clientBuildId,
    isProduction: env.nodeEnv === "production",
  });

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(requestContextMiddleware(logger));
  app.use(clientVersionMiddleware({ expectedBuildId: clientVersion.build_id }));

  registerControllers(
    app,
    [
      authController,
      auditController,
      healthController,
      hotelsController,
      settingsUserController,
      usersController,
      clientsController
    ],
    { apiPrefix: "/api" },
  );

  if (env.nodeEnv === "production") {
    app.use(
      express.static(clientDist, {
        setHeaders(res, filePath) {
          if (filePath.endsWith("index.html") || filePath.endsWith("client-version.json")) {
            res.setHeader("cache-control", "no-store");
            return;
          }

          res.setHeader("cache-control", "public, max-age=31536000, immutable");
        },
      }),
    );
    app.get("*", (_req, res) => {
      res.setHeader("cache-control", "no-store");
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(errorMiddleware);

  return app;
}
