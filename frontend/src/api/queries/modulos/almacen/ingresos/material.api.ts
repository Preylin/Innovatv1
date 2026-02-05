import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";
import { RegistrarIngresoMaterialCreateApiSchema, RegistrarIngresoMaterialOutApiSchema, StockActualDetalladoMaterialOutApiSchema, StockActualLimiteMaterial, type RegistrarIngresoMaterialCreateApiType, type RegistrarIngresoMaterialOutApiType } from "./material.api.schema";


export function useCatalogoIngresoMaterialList() {
  return useQuery({
    queryKey: ["ingresoMaterial"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMaterial"),
      schema: RegistrarIngresoMaterialOutApiSchema.array(),
    }),
  });
}

export function useCatalogoStockDetalladoMaterialList() {
  return useQuery({
    queryKey: ["stockDetalladoMaterial"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMaterial/stock_actual_detallado"),
      schema: StockActualDetalladoMaterialOutApiSchema.array(),
    }),
  });
}

export function useCatalogoStockLimiteMaterialList() {
  return useQuery({
    queryKey: ["stockLimiteMaterial"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMaterial/stock_actual_limite"),
      schema: StockActualLimiteMaterial.array(),
    }),
  });
}

export function useCreateIngresoMaterial() {
  const qc = useQueryClient();

  return useMutation<
    RegistrarIngresoMaterialOutApiType[],
    ApiError,
    RegistrarIngresoMaterialCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/ingresoMaterial", payload),
      inputSchema: RegistrarIngresoMaterialCreateApiSchema,
      outputSchema: RegistrarIngresoMaterialOutApiSchema.array(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingresoMaterial"] });
    },
  });
}

export function useDeteteIngresoMaterial(){
  const qc = useQueryClient();

  return useMutation<void, ApiError,number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/ingresoMaterial/${id}`),
      })(),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["ingresoMaterial"] });
      },  
  });
      }
