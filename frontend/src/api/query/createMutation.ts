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
      // Frontera de entrada
      const parsedInput = inputSchema.parse(input);

      // Request
      const response = await request(parsedInput);

      // Frontera de salida (condicional)
      if (outputSchema) {
        return outputSchema.parse(response.data);
      }

      // Endpoint sin respuesta
      return undefined as TOutput;
    } catch (err) {
      const normalized = normalizeError(err);

      throw new ApiError({
        message: normalized.message,
        httpStatus: normalized.httpStatus,
        kind: normalized.kind,
        data: normalized.kind === "validation" ? normalized.data : undefined,
        raw: normalized.raw,
      });
    }
  };
}



//uso en tanstack form para los errores

// const { mutate, error } = useCreateUsuario();

// if (error instanceof ApiError && error.kind === "validation") {
//   error.data.forEach(e => {
//     const field = e.loc.at(-1);
//     // mapear directamente a formulario
//   });
// }