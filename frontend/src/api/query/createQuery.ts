import type { ZodType } from "zod";
import { ApiError, normalizeError } from "../normalizeError";

type CreateQueryParams<T> = {
  request: () => Promise<{ data: unknown }>;
  schema: ZodType<T>;
};

export function createQuery<T>({ request, schema }: CreateQueryParams<T>) {
  return async (): Promise<T> => {
    try {
      const response = await request();
      return schema.parse(response.data);
    } catch (err) {
      // 1. Obtenemos el error ya normalizado con su unión discriminada correcta
      const normalized = normalizeError(err);

      // 2. Pasamos el objeto completo al constructor. 
      // Esto mantiene la integridad de los tipos: validation, http o unknown.
      throw new ApiError(normalized);
    }
  };
}