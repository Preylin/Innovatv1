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

      return response.data as TOutput;
    } catch (err) {
      // SI YA ES UN ApiError (Lanzado desde el interceptor de Axios), lo dejamos pasar directo
      if (err instanceof ApiError) throw err;
      
      // Si fue un error de parseo de Zod en el cliente, lo normalizamos aquí
      throw new ApiError(normalizeError(err));
    }
  };
}
