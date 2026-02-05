import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import { CatalogoMaterialCreateApiSchema, CatalogoMaterialOutSchema, CatalogoMaterialUpdateApiSchema, type CatalogoMaterialCreateApiType, type CatalogoMaterialOutType, type CatalogoMaterialUpdateApiType } from "./material.api.schema";
import api from "../../../../../client";
import type { ApiError } from "../../../../../normalizeError";
import { createMutation } from "../../../../../query/createMutation";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";



export function useCatalogoMaterialList() {
  return useQuery({
    queryKey: ["catalogoMaterial"],
    queryFn: createQuery({
      request: () => api.get("/catalogoMaterial"),
      schema: CatalogoMaterialOutSchema.array(),
    }),
  });
}

export function useCreateCatalogoMaterial() {
  const qc = useQueryClient();

  return useMutation<
    CatalogoMaterialOutType,
    ApiError,
    CatalogoMaterialCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/catalogoMaterial", payload),
      inputSchema: CatalogoMaterialCreateApiSchema,
      outputSchema: CatalogoMaterialOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMaterial"] });
    },
  });
}

export function useUpdateCatalogoMaterial(id: number) {
  const qc = useQueryClient();

  return useMutation<
    CatalogoMaterialOutType,
    ApiError,
    CatalogoMaterialUpdateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/catalogoMaterial/${id}`, payload),
      inputSchema: CatalogoMaterialUpdateApiSchema,
      outputSchema: CatalogoMaterialOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMaterial"] });
    },
  });
}

export function useDeleteCatalogoMaterial() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/catalogoMaterial/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogoMaterial"] });
    },
  });
}
