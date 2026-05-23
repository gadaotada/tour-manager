import axios, { type AxiosError, type AxiosRequestConfig, type ResponseType } from "axios";

import { logger } from "@libs/logger";

const apiLogger = logger.child({ area: "api" });

type HttpResponseMode = Extract<ResponseType, "json" | "text">;

const HTTP_RESPONSE_MODE = {
  json: "json",
  text: "text",
} as const satisfies Record<HttpResponseMode, HttpResponseMode>;

const httpClient = axios.create({
  withCredentials: true,
  responseType: HTTP_RESPONSE_MODE.json,
  headers: {
    accept: "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    apiLogger.error(
      {
        err: error,
        method: error.config?.method,
        url: error.config?.url,
        status: error.response?.status,
      },
      "HTTP request failed",
      { report: true },
    );

    return Promise.reject(error);
  },
);

const jsonRequest = <T = unknown>(config: AxiosRequestConfig) => {
  return httpClient.request<T>({
    ...config,
    responseType: HTTP_RESPONSE_MODE.json,
    headers: {
      accept: "application/json",
      ...config.headers,
    },
  });
};

const textRequest = (config: AxiosRequestConfig) => {
  return httpClient.request<string>({
    ...config,
    responseType: HTTP_RESPONSE_MODE.text,
    headers: {
      accept: "text/plain, text/html, */*",
      ...config.headers,
    },
  });
};

export { HTTP_RESPONSE_MODE, httpClient, jsonRequest, textRequest };
export type { HttpResponseMode };
