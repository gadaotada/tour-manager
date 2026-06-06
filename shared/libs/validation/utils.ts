export function safeJsonParser<T = {}>(jsonString: T): T | {} {
    if (typeof jsonString !== "string") {
    return {};
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return {};
  }
}