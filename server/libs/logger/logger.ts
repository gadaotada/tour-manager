import pino from "pino";
import {
  isLogLevelEnabled,
  normalizeLogError,
  sanitizeLogMeta,
  type LogLevel,
  type LogMeta,
  type LogOptions,
  type LogReporter,
  type LogSanitizerConfig,
  type Logger,
  type LoggerChildOptions,
  type SanitizedLogMeta,
} from "@tour-manager/shared";

import { env } from "@libs/config";

type ServerLoggerConfig = {
  level: LogLevel;
  reportErrors: boolean;
  reportWarnings: boolean;
  baseMeta: LogMeta;
  reporter?: LogReporter;
  sanitizer?: LogSanitizerConfig;
};

type LoggerState = {
  pino: pino.Logger;
  level: LogLevel;
  reportErrors: boolean;
  reportWarnings: boolean;
  baseMeta: LogMeta;
  childMeta: LogMeta;
  reporter: LogReporter | undefined;
  sanitizer: LogSanitizerConfig | undefined;
};

class ServerLogger implements Logger {
  constructor(private readonly state: LoggerState) {}

  error(meta: LogMeta, message: string, options?: LogOptions): void {
    this.emit("error", meta, message, options);
  }

  warn(meta: LogMeta, message: string, options?: LogOptions): void {
    this.emit("warn", meta, message, options);
  }

  info(meta: LogMeta, message: string, options?: LogOptions): void {
    this.emit("info", meta, message, options);
  }

  debug(meta: LogMeta, message: string, options?: LogOptions): void {
    this.emit("debug", meta, message, options);
  }

  child(meta: LogMeta, options?: LoggerChildOptions): Logger {
    return new ServerLogger({
      ...this.state,
      level: options?.level ?? this.state.level,
      reportErrors: options?.reportErrors ?? this.state.reportErrors,
      reportWarnings: options?.reportWarnings ?? this.state.reportWarnings,
      childMeta: {
        ...this.state.childMeta,
        ...meta,
      },
    });
  }

  private emit(
    level: Exclude<LogLevel, "silent">,
    meta: LogMeta,
    message: string,
    options?: LogOptions,
  ): void {
    if (!isLogLevelEnabled(this.state.level, level)) return;

    const normalizedError = meta.err === undefined ? null : normalizeLogError(meta.err);
    const sanitizedMeta = sanitizeLogMeta(
      {
        ...this.state.baseMeta,
        ...this.state.childMeta,
        ...meta,
      },
      this.state.sanitizer,
    );

    const entry = {
      meta: sanitizedMeta,
      ...(normalizedError ? { err: normalizedError } : {}),
    };

    this.state.pino[level](entry, message);

    if (isReportableLevel(level) && this.shouldReport(level, options)) {
      this.report(level, message, sanitizedMeta, normalizedError);
    }
  }

  private shouldReport(level: Exclude<LogLevel, "silent">, options?: LogOptions): boolean {
    if (options?.report !== undefined) return options.report;
    if (level === "error") return this.state.reportErrors;
    if (level === "warn") return this.state.reportWarnings;
    return false;
  }

  private report(
    level: Exclude<LogLevel, "silent" | "info" | "debug">,
    message: string,
    meta: SanitizedLogMeta,
    err: ReturnType<typeof normalizeLogError> | null,
  ): void {
    if (!this.state.reporter) return;

    void this.state.reporter.captureError({
      level,
      message,
      meta,
      err,
    });
  }
}

const isReportableLevel = (
  level: Exclude<LogLevel, "silent">,
): level is Exclude<LogLevel, "silent" | "info" | "debug"> => {
  return level === "error" || level === "warn";
};

const createServerLogger = (config: ServerLoggerConfig): Logger => {
  const pinoLogger = pino({
    level: config.level === "silent" ? "fatal" : config.level,
    base: null,
    messageKey: "message",
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return new ServerLogger({
    pino: pinoLogger,
    level: config.level,
    reportErrors: config.reportErrors,
    reportWarnings: config.reportWarnings,
    baseMeta: config.baseMeta,
    childMeta: {},
    reporter: config.reporter,
    sanitizer: config.sanitizer,
  });
};

const logger = createServerLogger({
  level: env.logLevel,
  reportErrors: env.logReportErrors,
  reportWarnings: env.logReportWarnings,
  baseMeta: {
    service: "server",
    environment: env.nodeEnv,
    buildId: env.appBuildId,
    release: env.appRelease,
  },
});

export { logger };
