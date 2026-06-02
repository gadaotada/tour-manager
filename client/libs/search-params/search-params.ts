type QueryPrimitive = boolean | number | string;

type NormalizeEnumOptions<TValue extends QueryPrimitive> = {
  fallback: TValue;
  values: readonly TValue[];
};

type NormalizeNumberOptions = {
  fallback?: number;
  max?: number;
  min?: number;
};

function normalizeBooleanSearchParam(raw: unknown): boolean | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }

  if (raw === true || raw === "true" || raw === "1" || raw === 1) {
    return true;
  }

  if (raw === false || raw === "false" || raw === "0" || raw === 0) {
    return false;
  }

  return undefined;
}

function normalizeEnumSearchParam<TValue extends QueryPrimitive>(
  raw: unknown,
  { fallback, values }: NormalizeEnumOptions<TValue>,
): TValue {
  return values.includes(raw as TValue) ? (raw as TValue) : fallback;
}

function normalizeIntegerSearchParam(
  raw: unknown,
  { fallback, max, min }: NormalizeNumberOptions = {},
): number | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    return fallback;
  }

  if (min !== undefined && value < min) {
    return fallback;
  }

  if (max !== undefined && value > max) {
    return fallback;
  }

  return value;
}

function normalizeStringSearchParam(raw: unknown, maxLength = 255): string | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }

  const value = raw.trim();
  return value.length > 0 ? value.slice(0, maxLength) : undefined;
}

export {
  normalizeBooleanSearchParam,
  normalizeEnumSearchParam,
  normalizeIntegerSearchParam,
  normalizeStringSearchParam,
};
