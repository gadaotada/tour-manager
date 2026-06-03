const API_ERROR_CODES = {
  CLIENT_VERSION_MISMATCH: "CLIENT_VERSION_MISMATCH",
} as const;

type ClientVersionMismatchDetails = {
  expected_build_id: string;
  received_build_id: string | null;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export {
  API_ERROR_CODES,
  type ClientVersionMismatchDetails,
};
