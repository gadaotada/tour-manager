import {
  isLogLevelEnabled,
  normalizeLogError,
  normalizeLogLevel,
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

type BrowserLoggerConfig = {
  level: LogLevel;
  reportErrors: boolean;
  reportWarnings: boolean;
  baseMeta: LogMeta;
  reporter?: LogReporter;
  sanitizer?: LogSanitizerConfig;
};

type LoggerState = {
  level: LogLevel;
  reportErrors: boolean;
  reportWarnings: boolean;
  baseMeta: LogMeta;
  childMeta: LogMeta;
  reporter: LogReporter | undefined;
  sanitizer: LogSanitizerConfig | undefined;
};

class BrowserLogger implements Logger {
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
    return new BrowserLogger({
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
      level,
      time: new Date().toISOString(),
      message,
      meta: sanitizedMeta,
      ...(normalizedError ? { err: normalizedError } : {}),
    };

    writeToConsole(level, entry);

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

const writeToConsole = (
  level: Exclude<LogLevel, "silent">,
  entry: Record<string, unknown>,
): void => {
  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      return;
    case "warn":
      console.warn(output);
      return;
    case "info":
      console.info(output);
      return;
    case "debug":
      console.debug(output);
      return;
  }
};

const createBrowserLogger = (config: BrowserLoggerConfig): Logger => {
  return new BrowserLogger({
    level: config.level,
    reportErrors: config.reportErrors,
    reportWarnings: config.reportWarnings,
    baseMeta: config.baseMeta,
    childMeta: {},
    reporter: config.reporter,
    sanitizer: config.sanitizer,
  });
};

const logger = createBrowserLogger({
  level: normalizeLogLevel(
    import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined,
    import.meta.env.MODE === "test" ? "silent" : import.meta.env.DEV ? "debug" : "info",
  ),
  reportErrors: import.meta.env.VITE_LOG_REPORT_ERRORS === "true",
  reportWarnings: import.meta.env.VITE_LOG_REPORT_WARNINGS === "true",
  baseMeta: {
    service: "client",
    environment: import.meta.env.MODE,
    buildId: import.meta.env.VITE_APP_BUILD_ID ?? "local",
    release: import.meta.env.VITE_APP_RELEASE,
  },
});

export { logger };
