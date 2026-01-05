import type { ApiError } from "../api/normalizeError";

export function authErrorToMessage(err: ApiError): string {
  if (err.httpStatus === 401) return "Usuario o contraseña incorrectos";
  if (err.httpStatus === 403) return "No tienes permisos para acceder";
  return err.message;
}