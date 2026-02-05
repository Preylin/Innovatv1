import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import api from "../../../../../client";

import { ApiError } from "../../../../../normalizeError";
import { createMutation } from "../../../../../query/createMutation";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";
import {
  ServiciosMcCreateApiSchema,
  ServiciosMCOutApiSchema,
  ServiciosMcUpdateApiSchema,
  type ServiciosMcCreateApiType,
  type ServiciosMCOutApiType,
} from "./serviciosMC.api.schema";

export function useServiciosMCList() {
  return useQuery({
    queryKey: ["serviciosMC"],
    queryFn: createQuery({
      request: () => api.get("/serviciosmc"),
      schema: ServiciosMCOutApiSchema.array(),
    }),
  });
}

export function useCreateServiciosMC() {
  const qc = useQueryClient();

  return useMutation<ServiciosMCOutApiType, ApiError, ServiciosMcCreateApiType>(
    {
      mutationFn: createMutation({
        request: (payload) => api.post("/serviciosmc", payload),
        inputSchema: ServiciosMcCreateApiSchema,
        outputSchema: ServiciosMCOutApiSchema,
      }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["serviciosMC"] });
      },
    },
  );
}

export function useUpdateServiciosMC(id: number) {
  const qc = useQueryClient();

  return useMutation<ServiciosMCOutApiType, ApiError, ServiciosMcCreateApiType>(
    {
      mutationFn: createMutation({
        request: (payload) => api.put(`/serviciosmc/${id}`, payload),
        inputSchema: ServiciosMcUpdateApiSchema,
        outputSchema: ServiciosMCOutApiSchema,
      }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["serviciosMC"] });
      },
    }
  );
}

export function useDeleteServiciosMC() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/serviciosmc/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC"] });
    },
  });
}
