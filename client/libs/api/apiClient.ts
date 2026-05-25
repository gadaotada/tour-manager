import type { ApiResponse } from "@tour-manager/shared";
import type { AxiosRequestConfig, Method } from "axios";

import { logger } from "@libs/logger";
import { httpClient } from "./httpClient";

type ApiRequestConfig<TFallback = never> = Omit<AxiosRequestConfig, "data" | "method" | "url"> & {
  fallbackData?: TFallback;
};

type ApiBodyRequestConfig<TFallback = never> = ApiRequestConfig<TFallback>;

type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

type RequestOptions<T> = {
  body?: unknown | undefined;
  config?: ApiRequestConfig<T> | undefined;
  kind: "json" | "text";
  method: Method;
  path: string;
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
    get: <T>(path: string, config?: ApiRequestConfig<T>) =>
      executeRequest<T>({ method: "GET", path, kind: "json", config }),
    post: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      executeRequest<T>({ method: "POST", path, kind: "json", body, config }),
    put: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      executeRequest<T>({ method: "PUT", path, kind: "json", body, config }),
    patch: <T, TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<T>) =>
      executeRequest<T>({ method: "PATCH", path, kind: "json", body, config }),
    delete: <T>(path: string, config?: ApiRequestConfig<T>) =>
      executeRequest<T>({ method: "DELETE", path, kind: "json", config }),
  },
  text: {
    get: (path: string, config?: ApiRequestConfig<string>) =>
      executeRequest<string>({ method: "GET", path, kind: "text", config }),
    post: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      executeRequest<string>({ method: "POST", path, kind: "text", body, config }),
    put: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      executeRequest<string>({ method: "PUT", path, kind: "text", body, config }),
    patch: <TBody = unknown>(path: string, body?: TBody, config?: ApiBodyRequestConfig<string>) =>
      executeRequest<string>({ method: "PATCH", path, kind: "text", body, config }),
    delete: (path: string, config?: ApiRequestConfig<string>) =>
      executeRequest<string>({ method: "DELETE", path, kind: "text", config }),
  },
};

async function executeRequest<T>({
  body,
  config,
  kind,
  method,
  path,
}: RequestOptions<T>): Promise<T> {
  const isJson = kind === "json";

  const response = await httpClient.request<unknown>({
    ...config,
    method,
    url: path,
    data: body,
    responseType: kind,
    ...(isJson ? { validateStatus: () => true } : {}),
    headers: {
      accept: isJson ? "application/json" : "text/plain, text/html, */*",
      ...config?.headers,
    },
  });

  if (isJson) {
    return parseJsonResponse<T>(path, response.status, response.data, config);
  }

  if (typeof response.data !== "string") {
    return handleMalformedResponse(path, "text", response.data, config);
  }

  return response.data as T;
}

function parseJsonResponse<T>(
  path: string,
  status: number,
  data: unknown,
  config?: ApiRequestConfig<T>,
): T {
  if (isEmptySuccessResponse(status, data)) {
    return undefined as T;
  }

  if (!isApiResponse<T>(data)) {
    return handleMalformedResponse(path, "ApiResponse<T>", data, config);
  }

  if (!data.ok) {
    const error = new ApiClientError(data.error, status);

    apiLogger.warn(
      {
        err: error,
        code: data.error.code,
        status,
        url: path,
      },
      "API returned an error response",
    );

    throw error;
  }

  return data.data;
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

function isEmptySuccessResponse(status: number, data: unknown): boolean {
  if (status === 204) {
    return true;
  }

  return (
    status >= 200 &&
    status < 300 &&
    (data === "" || data === null || data === undefined)
  );
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
