import type { JsonValue, LogMeta, LogSanitizerConfig, SanitizedLogMeta } from "./types";

const DEFAULT_REDACTED_KEYS = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "session",
  "sessionId",
  "secret",
  "apiKey",
  "dbPassword",
] as const;

const DEFAULT_SANITIZER_CONFIG = {
  redactedKeys: DEFAULT_REDACTED_KEYS,
  replacement: "[REDACTED]",
  maxDepth: 6,
  maxArrayLength: 50,
  maxStringLength: 5000,
} as const satisfies Required<LogSanitizerConfig>;

const sanitizeLogMeta = (
  meta: LogMeta,
  config?: LogSanitizerConfig,
): SanitizedLogMeta => {
  const parsedConfig = parseConfig(config);
  const seen = new WeakSet<object>();
  const sanitized = sanitizeValue(meta, parsedConfig, seen, 0);

  return isPlainRecord(sanitized) ? sanitized : {};
};

const sanitizeValue = (
  value: unknown,
  config: Required<LogSanitizerConfig>,
  seen: WeakSet<object>,
  depth: number,
): JsonValue => {
  if (depth > config.maxDepth) return "[MaxDepth]";

  switch (typeof value) {
    case "string":
      return limitString(value, config.maxStringLength);
    case "number":
      return Number.isFinite(value) ? value : String(value);
    case "boolean":
      return value;
    case "bigint":
      return `[BigInt:${value.toString()}]`;
    case "symbol":
      return "[Symbol]";
    case "function":
      return "[Function]";
    case "undefined":
      return "[Undefined]";
    case "object":
      break;
    default:
      return "[Unreadable]";
  }

  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (seen.has(value)) return "[Circular]";

  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .slice(0, config.maxArrayLength)
      .map((item) => sanitizeValue(item, config, seen, depth + 1));
  }

  const output: Record<string, JsonValue> = {};

  for (const [key, childValue] of Object.entries(value)) {
    if (key === "err") continue;

    output[key] = shouldRedactKey(key, config.redactedKeys)
      ? config.replacement
      : sanitizeValue(childValue, config, seen, depth + 1);
  }

  return output;
};

const parseConfig = (config?: LogSanitizerConfig): Required<LogSanitizerConfig> => ({
  redactedKeys: config?.redactedKeys ?? DEFAULT_SANITIZER_CONFIG.redactedKeys,
  replacement: config?.replacement ?? DEFAULT_SANITIZER_CONFIG.replacement,
  maxDepth: Math.min(config?.maxDepth ?? DEFAULT_SANITIZER_CONFIG.maxDepth, 20),
  maxArrayLength: config?.maxArrayLength ?? DEFAULT_SANITIZER_CONFIG.maxArrayLength,
  maxStringLength: config?.maxStringLength ?? DEFAULT_SANITIZER_CONFIG.maxStringLength,
});

const shouldRedactKey = (key: string, redactedKeys: readonly string[]): boolean => {
  const normalizedKey = key.toLowerCase();
  return redactedKeys.some((redactedKey) => normalizedKey === redactedKey.toLowerCase());
};

const limitString = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...[Truncated]`;
};

const isPlainRecord = (value: JsonValue): value is Record<string, JsonValue> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export {
  DEFAULT_REDACTED_KEYS,
  DEFAULT_SANITIZER_CONFIG,
  sanitizeLogMeta,
};
