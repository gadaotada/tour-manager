import type { ApiResponse } from "@tour-manager/shared";
import type { AxiosRequestConfig, Method } from "axios";

import { logger } from "@libs/logger";
import { jsonRequest, textRequest } from "./httpClient";

type ApiRequestConfig<TFallback = never> = Omit<AxiosRequestConfig, "data" | "method" | "url"> & {
  fallbackData?: TFallback;
};

type ApiBodyRequestConfig<TFallback = never> = ApiRequestConfig<TFallback>;

type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

class ApiClientError extends Error {
  readonly name = "ApiClientError";

  constructor(
    public readonly payload: ApiErrorPayload,
    public readonly status?: number,
  ) {
    super(payload.message);
  }
}

const apiLogger = logger.child({ area: "api.client" });

const api = {
  json: {
    get: <T>(path: string, config?: ApiRequestConfig<T>) => requestApiJson<T>("GET", path, undefined, config),
    post: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      requestApiJson<T>("POST", path, body, config),
    put: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      requestApiJson<T>("PUT", path, body, config),
    patch: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      requestApiJson<T>("PATCH", path, body, config),
    delete: <T>(path: string, config?: ApiRequestConfig<T>) =>
      requestApiJson<T>("DELETE", path, undefined, config),
  },
  text: {
    get: (path: string, config?: ApiRequestConfig<string>) => requestText("GET", path, undefined, config),
    post: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      requestText("POST", path, body, config),
    put: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      requestText("PUT", path, body, config),
    patch: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      requestText("PATCH", path, body, config),
    delete: (path: string, config?: ApiRequestConfig<string>) => requestText("DELETE", path, undefined, config),
  },
};

async function requestApiJson<T>(
  method: Method,
  path: string,
  body?: unknown,
  config?: ApiRequestConfig<T>,
): Promise<T> {
  const response = await jsonRequest<unknown>({
    ...config,
    method,
    url: path,
    data: body,
  });

  if (!isApiResponse<T>(response.data)) {
    return handleMalformedResponse(path, "ApiResponse<T>", response.data, config);
  }

  if (!response.data.ok) {
    const error = new ApiClientError(response.data.error, response.status);

    apiLogger.warn(
      {
        err: error,
        code: response.data.error.code,
        status: response.status,
        url: path,
      },
      "API returned an error response",
    );

    throw error;
  }

  return response.data.data;
}

async function requestText(
  method: Method,
  path: string,
  body?: unknown,
  config?: ApiRequestConfig<string>,
): Promise<string> {
  const response = await textRequest({
    ...config,
    method,
    url: path,
    data: body,
  });

  if (typeof response.data !== "string") {
    return handleMalformedResponse(path, "text", response.data, config);
  }

  return response.data;
}

function handleMalformedResponse<T>(
  path: string,
  expected: string,
  actual: unknown,
  config?: ApiRequestConfig<T>,
): T {
  apiLogger.error(
    {
      actualType: typeof actual,
      expected,
      url: path,
    },
    "API returned malformed response",
    { report: true },
  );

  if (config && "fallbackData" in config) {
    return config.fallbackData as T;
  }

  throw new ApiClientError({
    code: "MALFORMED_API_RESPONSE",
    message: "API returned malformed response.",
  });
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ApiResponse<T>>;

  if (candidate.ok === true) {
    return "data" in candidate;
  }

  if (candidate.ok === false) {
    return (
      !!candidate.error &&
      typeof candidate.error === "object" &&
      typeof candidate.error.code === "string" &&
      typeof candidate.error.message === "string"
    );
  }

  return false;
}

export { ApiClientError, api };
export type { ApiBodyRequestConfig, ApiRequestConfig };
