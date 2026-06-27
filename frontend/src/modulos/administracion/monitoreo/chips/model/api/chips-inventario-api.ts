import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChipInventarioCreateApiSchema, ChipInventarioDeleteApiSchema, ChipInventarioOutApiSchema, ChipInventarioUpdateApiSchema, type ChipInventarioCreateApiType, type ChipInventarioDeleteApiType, type ChipInventarioUpdateApiType } from "./chips-inventario-schema";
import api from "../../../../../../api/client";
import { createQuery } from "../../../../../../api/query/createQuery";
import { createMutation } from "../../../../../../api/query/createMutation";
import type { ApiError } from "../../../../../../api/normalizeError";


export function useChipInventarioList() {
  return useQuery({
    queryKey: ["chip-inventario-lista"],
    queryFn: createQuery({
      request: () => api.get("/servicio-inventario-chips/mostrar"),
      schema: ChipInventarioOutApiSchema.array(),
    }),
  });
}

export function useUpdateChipInventario(id: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiError, ChipInventarioUpdateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/servicio-inventario-chips/actualizar/${id}`, payload),
      inputSchema: ChipInventarioUpdateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chip-inventario-lista"] });
    },
  });
}

export function useDeleteChipInventarioSoft() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, ChipInventarioDeleteApiType>({
    mutationFn: createMutation({
      request: ({ id, ...body }) =>
        api.patch(`/servicio-inventario-chips/eliminar-servicio-inventario-chips-soft/${id}`, body),
      inputSchema: ChipInventarioDeleteApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chip-inventario-lista"] });
    },
  });
}

export function useRegistrarChipInventario() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, ChipInventarioCreateApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/servicio-inventario-chips/registrar-servicio-inventario-chips", payload),
      inputSchema: ChipInventarioCreateApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chip-inventario-lista"] });
    },
  });
}

