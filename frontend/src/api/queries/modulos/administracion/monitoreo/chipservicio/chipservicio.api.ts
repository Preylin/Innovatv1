import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import api from "../../../../../client";
import {
  ChipServicioCreateApiSchema,
  ChipServicioOutApiSchema,
  ChipServicioUpdateApiSchema,
  type ChipServicioCreateApiType,
  type ChipServicioOutApiType,
  type ChipServicioUpdateApiType,
} from "./chipservicio.api.schema";
import { ApiError } from "../../../../../normalizeError";
import { createMutation } from "../../../../../query/createMutation";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";

export function useChipServicioList() {
  return useQuery({
    queryKey: ["chipservicio"],
    queryFn: createQuery({
      request: () => api.get("/chipservicio"),
      schema: ChipServicioOutApiSchema.array(),
    }),
  });
}

export function useCreateChipServicio() {
  const qc = useQueryClient();

  return useMutation<
    ChipServicioOutApiType,
    ApiError,
    ChipServicioCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/chipservicio", payload),
      inputSchema: ChipServicioCreateApiSchema,
      outputSchema: ChipServicioOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio"] });
    },
  });
}

export function useUpdateChipServicio(id: number) {
  const qc = useQueryClient();

  return useMutation<
    ChipServicioOutApiType,
    ApiError,
    ChipServicioUpdateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/chipservicio/${id}`, payload),
      inputSchema: ChipServicioUpdateApiSchema,
      outputSchema: ChipServicioOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio"] });
    },
  });
}

export function useDeleteChipServicio() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/chipservicio/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio"] });
    },
  });
}
