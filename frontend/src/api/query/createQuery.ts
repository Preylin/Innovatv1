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
