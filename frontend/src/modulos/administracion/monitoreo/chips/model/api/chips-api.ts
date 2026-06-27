import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActualizarEstadoSchema, ChipsCreateApiSchema, ChipsOutApiSchema, ChipsUpdateApiSchema, type ActualizarEstadoSchemaType, type ChipsCreateApiType, type ChipsUpdateApiType } from "./chips-schema";
import { createQuery } from "../../../../../../api/query/createQuery";
import api from "../../../../../../api/client";
import type { ApiError } from "../../../../../../api/normalizeError";
import { createMutation } from "../../../../../../api/query/createMutation";
import { createDeleteMutation } from "../../../../../../api/query/createDeleteMutation";



export function useChipServicioList() {
  return useQuery({
    queryKey: ["chipservicio-lista"],
    queryFn: createQuery({
      request: () => api.get("/servicio-chips/mostrar"),
      schema: ChipsOutApiSchema.array(),
    }),
  });
}

export function useUpdateChipServicioEstado(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ActualizarEstadoSchemaType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.patch(`/servicio-chips/actualizar-chips-estado/${id}`, payload),
      inputSchema: ActualizarEstadoSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio-lista"] });
    },
  });
}

export function useUpdateChipServicio(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ChipsUpdateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/servicio-chips/actualizar/${id}`, payload),
      inputSchema: ChipsUpdateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio-lista"] });
    },
  });
}

export function useDeleteChipServicio() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/servicio-chips/eliminar-servicio-chips/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio-lista"] });
    },
  });
}

export function useRegistrarChipServicio() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, ChipsCreateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/servicio-chips/registrar-servicio-chips", payload),
      inputSchema: ChipsCreateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chipservicio-lista"] });
    },
  });
}

