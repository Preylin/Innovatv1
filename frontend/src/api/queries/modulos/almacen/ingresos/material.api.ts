import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import type { ApiError } from "../../../../normalizeError";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";
import {RegistrarIngresoMaterialOutApiSchema, StockActualDetalladoMaterialOutApiSchema, StockActualLimiteMaterial, type RegistrarIngresoMaterialOutApiType } from "./material.api.schema";


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
    RegistrarIngresoMaterialOutApiType[], // Tipo de respuesta del servidor
    ApiError,                             // Tipo de error
    FormData                              // Nuevo tipo de entrada (en lugar del objeto JSON)
  >({
    mutationFn: async (formData: FormData) => {
      // Realizamos el envío manual vía 'api' (axios)
      const response = await api.post("/ingresoMaterial", formData, {
        headers: {
          // Obligamos al navegador a tratarlo como envío de archivos
          "Content-Type": "multipart/form-data",
        },
      });

      // Validamos que la respuesta cumpla con el esquema esperado
      return RegistrarIngresoMaterialOutApiSchema.array().parse(response.data);
    },
    onSuccess: () => {
      // Invalida la caché para refrescar la lista de ingresos
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
