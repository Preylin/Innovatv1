import type { ZodType } from "zod";
import { ApiError, normalizeError } from "../normalizeError";

type CreateMutationParams<TInput, TOutput> = {
  request: (input: TInput) => Promise<{ data?: unknown }>;
  inputSchema: ZodType<TInput>;
  outputSchema?: ZodType<TOutput>;
};

export function createMutation<TInput, TOutput>({
  request,
  inputSchema,
  outputSchema,
}: CreateMutationParams<TInput, TOutput>) {
  return async (input: TInput): Promise<TOutput> => {
    try {
      // 1. Validar datos antes de enviarlos (Client-side validation)
      const parsedInput = inputSchema.parse(input);

      // 2. Ejecutar petición
      const response = await request(parsedInput);

      // 3. Validar respuesta (opcional)
      if (outputSchema) {
        return outputSchema.parse(response.data);
      }

      return undefined as TOutput;
    } catch (err) {
      // Si ya es un ApiError (lanzado por Zod o manualmente), lo re-lanzamos
      if (err instanceof ApiError) throw err;
      
      // Si es un error de Axios o Zod (parse), lo normalizamos y lanzamos como ApiError
      // Nuestra nueva clase ApiError ahora es mucho más limpia de instanciar:
      throw new ApiError(normalizeError(err));
    }
  };
}
