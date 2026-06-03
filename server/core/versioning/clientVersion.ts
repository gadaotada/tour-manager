import fs from "node:fs";
import path from "node:path";

type ClientVersion = {
  build_id: string;
};

type LoadClientVersionOptions = {
  clientDistPath: string;
  clientPublicPath: string;
  envBuildId: string | undefined;
  isProduction: boolean;
};

const CLIENT_VERSION_FILE = "client-version.json";
const DEVELOPMENT_CLIENT_BUILD_ID = "local-dev";

function loadClientVersion({
  clientDistPath,
  clientPublicPath,
  envBuildId,
  isProduction,
}: LoadClientVersionOptions): ClientVersion {
  if (envBuildId) {
    return { build_id: envBuildId };
  }

  const versionPath = path.join(
    isProduction ? clientDistPath : clientPublicPath,
    CLIENT_VERSION_FILE,
  );

  if (!fs.existsSync(versionPath)) {
    if (!isProduction) {
      return { build_id: DEVELOPMENT_CLIENT_BUILD_ID };
    }

    throw new Error(`Client version file not found: ${versionPath}`);
  }

  return parseClientVersion(versionPath, fs.readFileSync(versionPath, "utf8"));
}

function parseClientVersion(versionPath: string, raw: string): ClientVersion {
  const parsed = JSON.parse(raw) as Partial<ClientVersion>;

  if (!parsed.build_id || typeof parsed.build_id !== "string") {
    throw new Error(`Client version file has an invalid build_id: ${versionPath}`);
  }

  return { build_id: parsed.build_id };
}

export { loadClientVersion };
