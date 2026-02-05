import { ApiError, normalizeError } from "../normalizeError";

type CreateDeleteMutationParams = {
  request: () => Promise<unknown>; // Cambiado a unknown para mayor flexibilidad con axios
  message?: string; // Mensaje personalizado opcional
};

export function createDeleteMutation({
  request,
  message: customMessage,
}: CreateDeleteMutationParams) {
  return async (): Promise<void> => {
    try {
      await request();
    } catch (err) {
      // 1. Si ya es un ApiError (raro en delete pero posible), lo re-lanzamos
      if (err instanceof ApiError) throw err;

      // 2. Normalizamos el error de red o del servidor
      const normalized = normalizeError(err);

      // 3. Si el usuario pasó un mensaje personalizado, lo inyectamos al error HTTP
      // pero mantenemos la estructura si es un error de validación (412/422)
      if (customMessage && normalized.kind === "http") {
        normalized.message = customMessage;
      }

      // 4. Lanzamos usando el nuevo constructor simplificado
      throw new ApiError(normalized);
    }
  };
}