type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

type LogLevelNums = 0 |1 | 2 | 3 | 4;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type LogMeta = {
  err?: unknown;
  [key: string]: unknown;
};

type LogOptions = {
  report?: boolean;
};

type LoggerChildOptions = {
  level?: LogLevel;
  reportErrors?: boolean;
  reportWarnings?: boolean;
};

type SanitizedLogMeta = Record<string, JsonValue>;

type NormalizedLogError = {
  name: string;
  message: string;
  stack?: string;
};

type LogReporterPayload = {
  level: Exclude<LogLevel, "silent" | "info" | "debug">;
  message: string;
  meta: SanitizedLogMeta;
  err: NormalizedLogError | null;
};

type LogReporter = {
  captureError(payload: LogReporterPayload): void | Promise<void>;
};

type Logger = {
  error(meta: LogMeta, message: string, options?: LogOptions): void;
  warn(meta: LogMeta, message: string, options?: LogOptions): void;
  info(meta: LogMeta, message: string, options?: LogOptions): void;
  debug(meta: LogMeta, message: string, options?: LogOptions): void;
  child(meta: LogMeta, options?: LoggerChildOptions): Logger;
};

type LogSanitizerConfig = {
  redactedKeys?: readonly string[];
  replacement?: string;
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
};

export type {
  JsonValue,
  LogLevel,
  LogLevelNums,
  LogMeta,
  LogOptions,
  LogReporter,
  LogReporterPayload,
  LogSanitizerConfig,
  Logger,
  LoggerChildOptions,
  NormalizedLogError,
  SanitizedLogMeta,
};
