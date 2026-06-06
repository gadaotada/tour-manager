#!/usr/bin/env node

import { performance } from "node:perf_hooks";

const DEFAULT_BASE_URL = "http://localhost:3000";

const args = parseArgs(process.argv.slice(2));
const mode = args.mode ?? "list";
const baseUrl = stripTrailingSlash(args.baseUrl ?? process.env.API_BASE_URL ?? DEFAULT_BASE_URL);
const durationSeconds = toPositiveInt(args.duration ?? process.env.STRESS_DURATION, 15);
const connections = toPositiveInt(args.connections ?? process.env.STRESS_CONNECTIONS, 25);
const pageSize = toPositiveInt(args.pageSize ?? process.env.STRESS_PAGE_SIZE, 25);
console.log(`stress-hotels mode=${mode} baseUrl=${baseUrl}`);
const clientBuildId = await resolveClientBuildId();
console.log(`clientBuildId=${clientBuildId}`);

if (mode === "list") {
  await runListStress();
} else if (mode === "crud") {
  await runCrudStress();
} else {
  fail(`Unknown mode "${mode}". Use --mode=list or --mode=crud.`);
}

async function runListStress() {
  const autocannon = await loadAutocannon();
  const url = `${baseUrl}/api/hotels/list?page=1&page_size=${pageSize}&sort_by=created_at&sort_dir=DESC`;

  console.log(`GET ${url}`);
  console.log(`duration=${durationSeconds}s connections=${connections}`);

  const result = await runAutocannon(autocannon, {
    url,
    connections,
    duration: durationSeconds,
    pipelining: toPositiveInt(args.pipelining ?? process.env.STRESS_PIPELINING, 1),
    headers: {
      accept: "application/json",
      "app-lang": "en",
      "x-client-build-id": clientBuildId,
    },
  });

  console.log("");
  if (typeof autocannon.printResult === "function") {
    autocannon.printResult(result);
  }
  printAutocannonSummary(result);
}

async function runCrudStress() {
  const deadline = Date.now() + durationSeconds * 1000;
  const stats = createStats();
  const workers = Array.from({ length: connections }, (_, workerIndex) =>
    runCrudWorker(workerIndex + 1, deadline, stats),
  );

  console.log(`CRUD ${baseUrl}/api/hotels`);
  console.log(`duration=${durationSeconds}s workers=${connections}`);

  await Promise.all(workers);
  printCrudStats(stats);
}

async function runCrudWorker(workerId, deadline, stats) {
  let iteration = 0;

  while (Date.now() < deadline) {
    iteration += 1;
    const label = `${process.pid}-${workerId}-${iteration}-${Date.now()}`;

    try {
      const created = await timed(stats, "create", () =>
        jsonRequest("/api/hotels/create", {
          method: "POST",
          body: {
            name: `Stress Hotel ${label}`,
            address: `Stress Address ${label}`,
            stars: iteration % 7,
          },
        }),
      );

      const hotel = created.data;

      await timed(stats, "update", () =>
        jsonRequest("/api/hotels/update", {
          method: "PUT",
          body: {
            id: hotel.id,
            version: hotel.version,
            is_active: hotel.is_active,
            name: `${hotel.name} Updated`,
            address: `${hotel.address} Updated`,
            stars: (hotel.stars + 1) % 7,
          },
        }),
      );

      await timed(stats, "delete", () =>
        jsonRequest(`/api/hotels/delete/${hotel.id}`, {
          method: "DELETE",
          expectJson: false,
        }),
      );
    } catch (error) {
      stats.errors += 1;
      if (stats.samples.errors.length < 10) {
        stats.samples.errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
}

async function jsonRequest(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: {
      accept: "application/json",
      "app-lang": "en",
      "content-type": "application/json",
      "x-client-build-id": clientBuildId,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (options.expectJson === false) {
    if (!response.ok) {
      throw new Error(`${options.method} ${path} failed with ${response.status}`);
    }

    return null;
  }

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok || !json?.ok) {
    throw new Error(`${options.method} ${path} failed with ${response.status}: ${text}`);
  }

  return json;
}

async function timed(stats, operation, fn) {
  const start = performance.now();

  try {
    const result = await fn();
    recordLatency(stats.operations[operation], performance.now() - start);
    return result;
  } catch (error) {
    recordLatency(stats.operations[operation], performance.now() - start);
    throw error;
  }
}

function createStats() {
  return {
    errors: 0,
    operations: {
      create: createOperationStats(),
      update: createOperationStats(),
      delete: createOperationStats(),
    },
    samples: {
      errors: [],
    },
  };
}

function createOperationStats() {
  return {
    count: 0,
    totalMs: 0,
    minMs: Number.POSITIVE_INFINITY,
    maxMs: 0,
  };
}

function recordLatency(operation, latencyMs) {
  operation.count += 1;
  operation.totalMs += latencyMs;
  operation.minMs = Math.min(operation.minMs, latencyMs);
  operation.maxMs = Math.max(operation.maxMs, latencyMs);
}

function printCrudStats(stats) {
  const total = Object.values(stats.operations).reduce((sum, operation) => sum + operation.count, 0);

  console.log("");
  console.log(`total operations: ${total}`);
  console.log(`errors: ${stats.errors}`);

  for (const [name, operation] of Object.entries(stats.operations)) {
    const avgMs = operation.count === 0 ? 0 : operation.totalMs / operation.count;
    const minMs = operation.count === 0 ? 0 : operation.minMs;

    console.log(
      `${name}: count=${operation.count} avg=${avgMs.toFixed(2)}ms min=${minMs.toFixed(2)}ms max=${operation.maxMs.toFixed(2)}ms`,
    );
  }

  if (stats.samples.errors.length > 0) {
    console.log("");
    console.log("sample errors:");
    for (const error of stats.samples.errors) {
      console.log(`- ${error}`);
    }
  }
}

async function loadAutocannon() {
  try {
    const mod = await import("autocannon");
    return mod.default ?? mod;
  } catch {
    fail("Missing autocannon. Install it with: npm install -D autocannon");
  }
}

function runAutocannon(autocannon, options) {
  return new Promise((resolve, reject) => {
    autocannon(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });
}

function printAutocannonSummary(result) {
  console.log("");
  console.log("summary:");
  console.log(`requests/sec avg=${formatNumber(result.requests?.average)} total=${formatNumber(result.requests?.total)}`);
  console.log(`latency avg=${formatNumber(result.latency?.average)}ms p99=${formatNumber(result.latency?.p99)}ms max=${formatNumber(result.latency?.max)}ms`);
  console.log(`throughput avg=${formatBytes(result.throughput?.average)}/s total=${formatBytes(result.throughput?.total)}`);
  console.log(`2xx=${result["2xx"] ?? 0} non2xx=${result.non2xx ?? 0} errors=${result.errors ?? 0} timeouts=${result.timeouts ?? 0}`);
}

async function resolveClientBuildId() {
  const explicitBuildId = args.clientBuildId ?? process.env.CLIENT_BUILD_ID;

  if (explicitBuildId) {
    return explicitBuildId;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${baseUrl}/`, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const serverBuildId = response.headers.get("x-server-build-id");

    if (serverBuildId) {
      return serverBuildId;
    }
  } catch {
    // Fall through to the development default.
  }

  return "local-dev";
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (!arg.startsWith("--")) {
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=");
    const value = inlineValue ?? rawArgs[index + 1];
    parsed[toCamelCase(rawKey)] = value;

    if (inlineValue === undefined) {
      index += 1;
    }
  }

  return parsed;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripTrailingSlash(value) {
  return value.replace(/\/$/, "");
}

function formatNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-US") : "0";
}

function formatBytes(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
