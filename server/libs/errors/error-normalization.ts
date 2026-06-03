type ToErrorOptions = {
  fallbackMessage?: string;
};

const toError = (value: unknown, options: ToErrorOptions = {}): Error => {
  if (value instanceof Error) return value;

  const message = toErrorMessage(
    value,
    options.fallbackMessage ?? "Non-Error value thrown",
  );

  return new Error(message, { cause: value });
};

const toErrorMessage = (value: unknown, fallbackMessage: string): string => {
  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "boolean":
    case "bigint":
      return value.toString();
    case "symbol":
      return value.description ? `Symbol(${value.description})` : "Symbol";
    case "undefined":
      return fallbackMessage;
    case "function":
      return value.name ? `[Function: ${value.name}]` : "[Function]";
    case "object":
      return value === null ? fallbackMessage : fallbackMessage;
    default:
      return fallbackMessage;
  }
};

export { toError };
