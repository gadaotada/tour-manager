import axios, { type AxiosError } from "axios";
import { HTTP_HEADERS } from "@tour-manager/shared";

import { resolveRequestLocale } from "@libs/i18n/request-locale";
import { logger } from "@libs/logger";

const apiLogger = logger.child({ area: "api" });

const httpClient = axios.create({
  withCredentials: true,
  responseType: "json",
  headers: {
    accept: "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  config.headers.set(HTTP_HEADERS.APP_LANG, resolveRequestLocale());
  return config;
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

function setHttpClientDefaultHeader(name: string, value: string): void {
  httpClient.defaults.headers.common[name] = value;
}

export { httpClient, setHttpClientDefaultHeader };
