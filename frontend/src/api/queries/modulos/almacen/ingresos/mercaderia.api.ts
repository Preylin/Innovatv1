import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { RegistrarIngresoMercaderiaOutApiSchema, StockActualDetalladoOutApiSchema, StockActualLimite, type RegistrarIngresoMercaderiaOutApiType } from "./mercaderia.api.schema";
import type { ApiError } from "../../../../normalizeError";
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
    FormData // <-- Cambiamos el tipo de entrada de la mutación a FormData
  >({
    mutationFn: async (formData: FormData) => {
      // Nota: Aquí no usamos 'createMutation' tradicional si este no soporta FormData 
      // internamente con validación. Lo enviamos directo vía 'api'.
      const response = await api.post("/ingresoMercaderia", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Si quieres mantener la validación de salida (outputSchema):
      return RegistrarIngresoMercaderiaOutApiSchema.array().parse(response.data);
    },
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
