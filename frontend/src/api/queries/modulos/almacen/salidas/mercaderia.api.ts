import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { RegistrarSalidaMercaderiaCreateApiSchema, RegistrarSalidaMercaderiaOutApiSchema, type RegistrarSalidaMercaderiaCreateApiType, type RegistrarSalidaMercaderiaOutApiType } from "./mercaderia.api.schema";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
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
    RegistrarSalidaMercaderiaCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/salidaMercaderia", payload),
      inputSchema: RegistrarSalidaMercaderiaCreateApiSchema,
      outputSchema: RegistrarSalidaMercaderiaOutApiSchema.array(),
    }),
    onSuccess: () => {
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
