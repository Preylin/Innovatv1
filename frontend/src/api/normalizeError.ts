import axios from "axios";
import {
  ValidationErrorSchema,
  type ValidationErrorType,
} from "./auth.api.schema";

/* ======================================================
   NormalizedApiError
   ====================================================== */
export type NormalizedApiError =
  | {
      kind: "validation";
      httpStatus: 422 | 412;
      message: string;
      data: ValidationErrorType[];
      raw: unknown;
    }
  | {
      kind: "http";
      httpStatus: number | null;
      message: string;
      raw: unknown;
    }
  | {
      kind: "unknown";
      httpStatus: null;
      message: string;
      raw: unknown;
    };

/* ======================================================
   normalizeError
   ====================================================== */
export function normalizeError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const detail = error.response?.data?.detail;

    if ((status === 422 || status === 412) && Array.isArray(detail)) {
      const parsed = ValidationErrorSchema.array().safeParse(detail);

      if (parsed.success) {
        return {
          kind: "validation",
          httpStatus: status,
          message: "Error de validación",
          data: parsed.data,
          raw: error,
        };
      }
    }

    return {
      kind: "http",
      httpStatus: status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error HTTP",
      raw: error,
    };
  }

  return {
    kind: "unknown",
    httpStatus: null,
    message: "Error inesperado",
    raw: error,
  };
}

/* ======================================================
   ApiError
   ====================================================== */
export type ApiErrorData =
  | { kind: "validation"; data: ValidationErrorType[] }
  | { kind: "http"; data?: undefined }
  | { kind: "unknown"; data?: undefined };

export class ApiError extends Error {
  httpStatus: number | null;
  kind: ApiErrorData["kind"];
  data?: ValidationErrorType[];
  raw: unknown;

  constructor(params: {
    message: string;
    httpStatus: number | null;
    kind: ApiErrorData["kind"];
    data?: ValidationErrorType[];
    raw: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.httpStatus = params.httpStatus;
    this.kind = params.kind;
    this.data = params.data;
    this.raw = params.raw;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/* ======================================================
   toApiError (entry point)
   ====================================================== */
export function toApiError(err: unknown): ApiError {
  const normalized = normalizeError(err);

  return new ApiError({
    message: normalized.message,
    httpStatus: normalized.httpStatus,
    kind: normalized.kind,
    data: normalized.kind === "validation" ? normalized.data : undefined,
    raw: normalized.raw,
  });
}
