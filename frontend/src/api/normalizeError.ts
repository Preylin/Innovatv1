import axios from "axios";
import { ZodError } from "zod"; // IMPORTANTE: Agregar esta importación
import {
  ValidationErrorSchema,
  type ValidationErrorType,
} from "./auth.api.schema";

/* ======================================================
   Tipos y Configuración
   ====================================================== */

const VALIDATION_STATUS_CODES = [400, 409, 412, 422, 500] as const;
type ValidationStatus = typeof VALIDATION_STATUS_CODES[number];

export type NormalizedApiError =
  | {
      kind: "validation";
      httpStatus: ValidationStatus | 422; // 422 es el estándar para Zod local
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
  if (data?.message) return data.message;
  if (typeof data?.detail === "string") return data.detail;
  return error.message || "Error de comunicación con el servidor";
};

/* ======================================================
   normalizeError (Refactorizado con soporte Zod)
   ====================================================== */
export function normalizeError(error: unknown): NormalizedApiError {
  
  // --- MEJORA 1: Manejo de errores de Zod (Client-side o Output validation) ---
  if (error instanceof ZodError) {
    return {
      kind: "validation",
      httpStatus: 422, // Unprocessable Entity simulado para el cliente
      message: "Error de validación en los datos de entrada",
      // Transformamos el path de Zod al formato [loc] que espera tu helper
      data: error.issues.map((e) => ({
        loc: e.path as string[], 
        msg: e.message,
        type: e.code,
      })),
      raw: error,
    };
  }

  // --- MEJORA 2: Verificación de Axios ---
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

  // --- MEJORA 3: Validación del Servidor (FastAPI / Nest / etc) ---
  const isValidationStatus = status !== null && (VALIDATION_STATUS_CODES as readonly number[]).includes(status);

  // Si el servidor devuelve el array de errores estándar en 'detail'
  if (isValidationStatus && Array.isArray(detail)) {
    const parsed = ValidationErrorSchema.array().safeParse(detail);
    if (parsed.success) {
      return {
        kind: "validation",
        httpStatus: status as ValidationStatus,
        message: "Error de validación en el servidor",
        data: parsed.data,
        raw: error,
      };
    }
  }

  // 2. Normalizar como error HTTP GENÉRICO
  return {
    kind: "http",
    httpStatus: status,
    message: extractMessage(error),
    raw: error,
  };
}

/* ======================================================
   ApiError (Clase de Excepción) - Sin cambios, ya es robusta
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

export function toApiError(err: unknown): ApiError {
  return new ApiError(normalizeError(err));
}