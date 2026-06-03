import type { RequestHandler } from "express";

import {
  API_ERROR_CODES,
  HTTP_HEADERS,
  type ClientVersionMismatchDetails,
} from "@tour-manager/shared";
import { AppError } from "@core/http";

type ClientVersionMiddlewareOptions = {
  expectedBuildId: string;
};

function clientVersionMiddleware({
  expectedBuildId,
}: ClientVersionMiddlewareOptions): RequestHandler {
  return (req, res, next) => {
    res.setHeader(HTTP_HEADERS.SERVER_BUILD_ID, expectedBuildId);

    if (!req.path.startsWith("/api/")) {
      next();
      return;
    }

    const receivedBuildId = req.header(HTTP_HEADERS.CLIENT_BUILD_ID) ?? null;

    if (
      receivedBuildId !== null &&
      !isClientBuildOlder(receivedBuildId, expectedBuildId)
    ) {
      next();
      return;
    }

    const details: ClientVersionMismatchDetails = {
      expected_build_id: expectedBuildId,
      received_build_id: receivedBuildId,
    };

    res.setHeader("cache-control", "no-store");
    next(
      new AppError(
        409,
        API_ERROR_CODES.CLIENT_VERSION_MISMATCH,
        "errors.clientVersionMismatch",
        "Client version mismatch.",
        details,
      ),
    );
  };
}

function isClientBuildOlder(receivedBuildId: string, expectedBuildId: string): boolean {
  if (receivedBuildId === expectedBuildId) {
    return false;
  }

  const receivedBuildNumber = parseBuildNumber(receivedBuildId);
  const expectedBuildNumber = parseBuildNumber(expectedBuildId);

  if (receivedBuildNumber === null || expectedBuildNumber === null) {
    return true;
  }

  return receivedBuildNumber < expectedBuildNumber;
}

function parseBuildNumber(buildId: string): number | null {
  const match = /-(\d+)$/.exec(buildId);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export { clientVersionMiddleware };
