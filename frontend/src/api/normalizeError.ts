import axios from "axios";
import {
  ValidationErrorSchema,
  type ValidationErrorType,
} from "./auth.api.schema";

/* ======================================================
   Tipos y Configuración
   ====================================================== */

// Códigos que tu API usa para errores de lógica/validación estructurados
const VALIDATION_STATUS_CODES = [400, 409, 412, 422, 500] as const;
type ValidationStatus = typeof VALIDATION_STATUS_CODES[number];

export type NormalizedApiError =
  | {
      kind: "validation";
      httpStatus: ValidationStatus;
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
   Utilidades de Extracción
   ====================================================== */

const extractMessage = (error: any): string => {
  const data = error.response?.data;
  // Prioridad: message personalizado -> detail (si es string) -> mensaje de axios -> default
  if (data?.message) return data.message;
  if (typeof data?.detail === "string") return data.detail;
  return error.message || "Error de comunicación con el servidor";
};

/* ======================================================
   normalizeError (Refactorizado)
   ====================================================== */
export function normalizeError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError(error)) {
    return {
      kind: "unknown",
      httpStatus: null,
      message: "Error inesperado fuera del flujo de red",
      raw: error,
    };
  }

  const status = error.response?.status ?? null;
  const detail = error.response?.data?.detail;

  // 1. Intentar normalizar como error de VALIDACIÓN/ESTRUCTURADO
  const isValidationStatus = status !== null && (VALIDATION_STATUS_CODES as readonly number[]).includes(status);

  if (isValidationStatus && Array.isArray(detail)) {
    const parsed = ValidationErrorSchema.array().safeParse(detail);
    if (parsed.success) {
      return {
        kind: "validation",
        httpStatus: status as ValidationStatus,
        message: "Error de validación en los datos",
        data: parsed.data,
        raw: error,
      };
    }
  }

  // 2. Normalizar como error HTTP GENÉRICO (401, 403, 404, 500...)
  return {
    kind: "http",
    httpStatus: status,
    message: extractMessage(error),
    raw: error,
  };
}

/* ======================================================
   ApiError (Clase de Excepción)
   ====================================================== */
export class ApiError extends Error {
  public readonly httpStatus: number | null;
  public readonly kind: NormalizedApiError["kind"];
  public readonly data?: ValidationErrorType[];
  public readonly raw: unknown;

  constructor(normalized: NormalizedApiError) {
    super(normalized.message);
    this.name = "ApiError";
    this.httpStatus = normalized.httpStatus;
    this.kind = normalized.kind;
    this.raw = normalized.raw;
    
    if (normalized.kind === "validation") {
      this.data = normalized.data;
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Punto de entrada para convertir cualquier error en un ApiError estandarizado
 */
export function toApiError(err: unknown): ApiError {
  return new ApiError(normalizeError(err));
}