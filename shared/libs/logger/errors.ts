import type { NormalizedLogError } from "./types";

const normalizeLogError = (err: unknown): NormalizedLogError => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      ...(err.stack ? { stack: err.stack } : {}),
    };
  }

  return {
    name: "NonErrorThrown",
    message: safeString(err),
  };
};

const safeString = (value: unknown): string => {
  try {
    if (typeof value === "string") return value;
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

export { normalizeLogError };
