import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { RegistrarSalidaMercaderiaOutApiSchema, type RegistrarSalidaMercaderiaOutApiType } from "./mercaderia.api.schema";
import type { ApiError } from "../../../../normalizeError";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";


export function useCatalogoSalidaMercaderiaList() {
  return useQuery({
    queryKey: ["salidaMercaderia"],
    queryFn: createQuery({
      request: () => api.get("/salidaMercaderia"),
      schema: RegistrarSalidaMercaderiaOutApiSchema.array(),
    }),
  });
}

export function useCreateSalidaMercaderia() {
  const qc = useQueryClient();

  return useMutation<
    RegistrarSalidaMercaderiaOutApiType[],
    ApiError,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      // Enviamos el FormData directamente vía 'api'
      const response = await api.post("/salidaMercaderia", formData, {
        headers: {
          // Aunque Axios suele detectarlo, forzarlo asegura el envío correcto
          "Content-Type": "multipart/form-data",
        },
      });

      // Validamos la respuesta del servidor con el esquema de salida
      return RegistrarSalidaMercaderiaOutApiSchema.array().parse(response.data);
    },
    onSuccess: () => {
      // Refrescamos la lista de salidas de mercadería
      qc.invalidateQueries({ queryKey: ["salidaMercaderia"] });
    },
  });
}

export function useDeteteSalidaMercaderia(){
  const qc = useQueryClient();

  return useMutation<void, ApiError,number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/salidaMercaderia/${id}`),
      })(),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["salidaMercaderia"] });
      },  
  });
      }
