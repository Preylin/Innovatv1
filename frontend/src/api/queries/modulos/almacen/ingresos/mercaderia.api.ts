import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { RegistrarIngresoMercaderiaCreateApiSchema, RegistrarIngresoMercaderiaOutApiSchema, StockActualDetalladoOutApiSchema, StockActualLimite, type RegistrarIngresoMercaderiaCreateApiType, type RegistrarIngresoMercaderiaOutApiType } from "./mercaderia.api.schema";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";


export function useCatalogoIngresoMercaderiaList() {
  return useQuery({
    queryKey: ["ingresoMercaderia"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMercaderia"),
      schema: RegistrarIngresoMercaderiaOutApiSchema.array(),
    }),
  });
}

export function useCatalogoStockDetalladoMercaderiaList() {
  return useQuery({
    queryKey: ["stockDetalladoMercaderia"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMercaderia/stock_actual_detallado"),
      schema: StockActualDetalladoOutApiSchema.array(),
    }),
  });
}

export function useCatalogoStockLimiteMercaderiaList() {
  return useQuery({
    queryKey: ["stockLimiteMercaderia"],
    queryFn: createQuery({
      request: () => api.get("/ingresoMercaderia/stock_actual_limite"),
      schema: StockActualLimite.array(),
    }),
  });
}

export function useCreateIngresoMercaderia() {
  const qc = useQueryClient();

  return useMutation<
    RegistrarIngresoMercaderiaOutApiType[],
    ApiError,
    RegistrarIngresoMercaderiaCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/ingresoMercaderia", payload),
      inputSchema: RegistrarIngresoMercaderiaCreateApiSchema,
      outputSchema: RegistrarIngresoMercaderiaOutApiSchema.array(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ingresoMercaderia"] });
    },
  });
}

export function useDeteteIngresoMercaderia(){
  const qc = useQueryClient();

  return useMutation<void, ApiError,number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/ingresoMercaderia/${id}`),
      })(),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["ingresoMercaderia"] });
      },  
  });
      }
