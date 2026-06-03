import {
  type ClientVersionMismatchDetails,
} from "@tour-manager/shared";

type ClientVersion = {
  build_id: string;
};

const CLIENT_VERSION_PATH = "/client-version.json";
const DEFAULT_CLIENT_BUILD_ID = "local-dev";

let clientBuildId = DEFAULT_CLIENT_BUILD_ID;
let bootstrapPromise: Promise<void> | undefined;
let isReloading = false;

function getClientBuildId(): string {
  return clientBuildId;
}

function bootstrapClientVersion(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = fetchClientVersion()
      .then((version) => {
        clientBuildId = version.build_id;
      })
      .catch(() => {
        clientBuildId = DEFAULT_CLIENT_BUILD_ID;
      });
  }

  return bootstrapPromise;
}

function handleClientVersionMismatch(
  details: ClientVersionMismatchDetails | undefined,
): void {
  if (isReloading || typeof window === "undefined") {
    return;
  }

  isReloading = true;

  refreshClientVersion(details)
    .catch(() => undefined)
    .finally(() => {
      const expectedBuildId = details?.expected_build_id ?? "unknown";
      const reloadKey = `tour-manager:client-version-reload:${expectedBuildId}`;

      if (window.sessionStorage.getItem(reloadKey) === "1") {
        isReloading = false;
        return;
      }

      window.sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    });
}

async function refreshClientVersion(
  details: ClientVersionMismatchDetails | undefined,
): Promise<void> {
  const version = await fetchClientVersion();
  clientBuildId = version.build_id || details?.expected_build_id || clientBuildId;
}

async function fetchClientVersion(): Promise<ClientVersion> {
  const response = await fetch(`${CLIENT_VERSION_PATH}?t=${Date.now()}`, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Client version file could not be loaded.");
  }

  const data = (await response.json()) as Partial<ClientVersion>;

  if (!data.build_id || typeof data.build_id !== "string") {
    throw new Error("Client version file has an invalid build_id.");
  }

  return { build_id: data.build_id };
}

export {
  bootstrapClientVersion,
  getClientBuildId,
  handleClientVersionMismatch,
};
