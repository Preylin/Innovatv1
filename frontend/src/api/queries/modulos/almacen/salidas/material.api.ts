import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import type { ApiError } from "../../../../normalizeError";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";
import { RegistrarSalidaMaterialOutApiSchema, type RegistrarSalidaMaterialOutApiType } from "./material.api.schema";


export function useCatalogoSalidaMaterialList() {
  return useQuery({
    queryKey: ["salidaMaterial"],
    queryFn: createQuery({
      request: () => api.get("/salidaMaterial"),
      schema: RegistrarSalidaMaterialOutApiSchema.array(),
    }),
  });
}

export function useCreateSalidaMaterial() {
  const qc = useQueryClient();

  return useMutation<
    RegistrarSalidaMaterialOutApiType[], // Tipo de respuesta exitosa
    ApiError,                            // Tipo de error
    FormData                             // El nuevo tipo de entrada
  >({
    mutationFn: async (formData: FormData) => {
      // Enviamos el FormData directamente
      const response = await api.post("/salidaMaterial", formData, {
        headers: {
          // Importante para el manejo de archivos
          "Content-Type": "multipart/form-data",
        },
      });

      // Validamos y devolvemos la respuesta usando el esquema de salida existente
      return RegistrarSalidaMaterialOutApiSchema.array().parse(response.data);
    },
    onSuccess: () => {
      // Refrescamos los datos de materiales
      qc.invalidateQueries({ queryKey: ["salidaMaterial"] });
    },
  });
}

export function useDeteteSalidaMaterial(){
  const qc = useQueryClient();

  return useMutation<void, ApiError,number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/salidaMaterial/${id}`),
      })(),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["salidaMaterial"] });
      },  
  });
      }
