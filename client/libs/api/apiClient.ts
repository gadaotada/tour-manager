import type { ApiResponse } from "@tour-manager/shared";
import { HTTP_HEADERS } from "@tour-manager/shared";

import { resolveRequestLocale } from "@libs/i18n/request-locale";
import { logger } from "@libs/logger";
import { getRealtimeSocketId } from "@libs/realtime";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryParamValue = boolean | number | string | null | undefined;

type ApiRequestConfig<TFallback = never> = Omit<RequestInit, "body" | "method"> & {
  fallbackData?: TFallback;
  headers?: HeadersInit;
  params?: Record<string, QueryParamValue>;
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
  method: HttpMethod;
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
const defaultHeaders = new Headers();

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
  const url = createRequestUrl(path, config?.params);
  const headers = createRequestHeaders(config?.headers, isJson, body);
  const { fallbackData: _fallbackData, params: _params, ...requestConfig } = config ?? {};

  let response: Response;

  try {
    response = await fetch(url, {
      ...requestConfig,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: requestConfig.credentials ?? "include",
      headers,
      method,
    });
  } catch (error) {
    apiLogger.error(
      {
        err: error,
        method,
        url,
      },
      "HTTP request failed",
      { report: true },
    );

    throw error;
  }

  if (isJson) {
    const data = await readJsonResponse(response);
    return parseJsonResponse<T>(path, response.status, data, config);
  }

  return (await response.text()) as T;
}

function createRequestUrl(
  path: string,
  params: ApiRequestConfig["params"],
): string {
  if (!params) {
    return path;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  if (!query) {
    return path;
  }

  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

function createRequestHeaders(
  headers: HeadersInit | undefined,
  isJson: boolean,
  body: unknown,
): Headers {
  const requestHeaders = new Headers(defaultHeaders);

  requestHeaders.set(
    "accept",
    isJson ? "application/json" : "text/plain, text/html, */*",
  );
  requestHeaders.set(HTTP_HEADERS.APP_LANG, resolveRequestLocale());

  const socketId = getRealtimeSocketId();
  if (socketId && !requestHeaders.has(HTTP_HEADERS.SOCKET_ID)) {
    requestHeaders.set(HTTP_HEADERS.SOCKET_ID, socketId);
  }

  if (body !== undefined && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }

  return requestHeaders;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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

function setHttpClientDefaultHeader(name: string, value: string): void {
  defaultHeaders.set(name, value);
}

export { ApiClientError, api, setHttpClientDefaultHeader };
export type { ApiBodyRequestConfig, ApiRequestConfig };
