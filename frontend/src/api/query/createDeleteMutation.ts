import { ApiError, normalizeError } from "../normalizeError";

type CreateDeleteMutationParams = {
  request: () => Promise<void>;
  message?: string;
};

export function createDeleteMutation({
  request,
}: CreateDeleteMutationParams) {
  return async (): Promise<void> => {
    try {
      await request();
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
