import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../../api/query/createQuery";
import { ActualizarEstadoSchema, ProCreateApiSchema, ProOutApiSchema, ProUpdateApiSchema, type ActualizarEstadoSchemaType, type ProCreateApiType, type ProUpdateApiType } from "./pro-schema-api";
import api from "../../../../../../api/client";
import { createMutation } from "../../../../../../api/query/createMutation";
import type { ApiError } from "../../../../../../api/normalizeError";
import { createDeleteMutation } from "../../../../../../api/query/createDeleteMutation";

export function useProList(){
    return useQuery({
        queryKey: ["pro-lista"],
        queryFn: createQuery({
            request: () => api.get("/servicio-pro/mostrar"),
            schema: ProOutApiSchema.array(),
        }),
    })
}

export function useUpdatePro(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ProUpdateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/servicio-pro/actualizar/${id}`, payload),
      inputSchema: ProUpdateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-lista"] });
    },
  });
}

export function useCreatePro() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, ProCreateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/servicio-pro/registrar-servicio-pro", payload),
      inputSchema: ProCreateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-lista"] });
    },
  });
}

export function useDeletePro() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/servicio-pro/eliminar-servicio-pro/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-lista"] });
    },
  });
}

export function useUpdateProEstado(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ActualizarEstadoSchemaType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.patch(`/servicio-pro/actualizar-pro-estado/${id}`, payload),
      inputSchema: ActualizarEstadoSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro-lista"] });
    },
  });
}