import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../../api/query/createQuery";
import { ActualizarEstadoSchema, McCreateApiSchema, McOutApiSchema, McUpdateApiSchema, type ActualizarEstadoSchemaType, type McCreateApiType, type McUpdateApiType } from "./mc-schema";
import api from "../../../../../../api/client";
import { createMutation } from "../../../../../../api/query/createMutation";
import type { ApiError } from "../../../../../../api/normalizeError";
import { createDeleteMutation } from "../../../../../../api/query/createDeleteMutation";



export function useServiciosMCList() {
  return useQuery({
    queryKey: ["serviciosMC-lista"],
    queryFn: createQuery({
      request: () => api.get("/servicio-mc/mostrar"),
      schema: McOutApiSchema.array(),
    }),
  });
}

export function useUpdateServiciosMCEstado(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ActualizarEstadoSchemaType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.patch(`/servicio-mc/actualizar-mc-estado/${id}`, payload),
      inputSchema: ActualizarEstadoSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC-lista"] });
    },
  });
}

export function useUpdateServiciosMC(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, McUpdateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/servicio-mc/actualizar/${id}`, payload),
      inputSchema: McUpdateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC-lista"] });
    },
  });
}

export function useDeleteServiciosMC() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/servicio-mc/eliminar-servicio-mc/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC-lista"] });
    },
  });
}

export function useRegistrarServiciosMC() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, McCreateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/servicio-mc/registrar-servicio-mc", payload),
      inputSchema: McCreateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviciosMC-lista"] });
    },
  });
}
