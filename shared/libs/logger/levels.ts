import type { LogLevel, LogLevelNums } from "./types";

const LOG_LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const satisfies Record<LogLevel, LogLevelNums>;

const isLogLevel = (value: string): value is LogLevel => {
  return value in LOG_LEVELS;
};

const normalizeLogLevel = (value: string | undefined, fallback: LogLevel): LogLevel => {
  if (!value) return fallback;
  const normalized = value.toLowerCase();
  return isLogLevel(normalized) ? normalized : fallback;
};

const isLogLevelEnabled = (configuredLevel: LogLevel, callLevel: LogLevel): boolean => {
  if (configuredLevel === "silent") return false;
  if (callLevel === "silent") return false;
  return LOG_LEVELS[callLevel] <= LOG_LEVELS[configuredLevel];
};

export { LOG_LEVELS, isLogLevel, isLogLevelEnabled, normalizeLogLevel };
