import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import { CatalogoMercaderiaCreateApiSchema, CatalogoMercaderiaOutSchema, CatalogoMercaderiaUpdateApiSchema, type CatalogoMercaderiaCreateApiType, type CatalogoMercaderiaOutType, type CatalogoMercaderiaUpdateApiType } from "./mercaderia.api.schema";
import api from "../../../../../client";
import type { ApiError } from "../../../../../normalizeError";
import { createMutation } from "../../../../../query/createMutation";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";



export function useCatalogoMercaderiaList() {
  return useQuery({
    queryKey: ["catalogoMercaderia"],
    queryFn: createQuery({
      request: () => api.get("/catalogoMercaderia"),
      schema: CatalogoMercaderiaOutSchema.array(),
    }),
  });
}

export function useCreateCatalogoMercaderia() {
  const qc = useQueryClient();

  return useMutation<
    CatalogoMercaderiaOutType,
    ApiError,
    CatalogoMercaderiaCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/catalogoMercaderia", payload),
      inputSchema: CatalogoMercaderiaCreateApiSchema,
      outputSchema: CatalogoMercaderiaOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMercaderia"] });
    },
  });
}

export function useUpdateCatalogoMercaderia(id: number) {
  const qc = useQueryClient();

  return useMutation<
    CatalogoMercaderiaOutType,
    ApiError,
    CatalogoMercaderiaUpdateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/catalogoMercaderia/${id}`, payload),
      inputSchema: CatalogoMercaderiaUpdateApiSchema,
      outputSchema: CatalogoMercaderiaOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMercaderia"] });
    },
  });
}

export function useDeleteCatalogoMercaderia() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/catalogoMercaderia/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMercaderia"] });
    },
  });
}
