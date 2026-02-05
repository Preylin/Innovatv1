import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";
import { RegistrarSalidaMaterialCreateApiSchema, RegistrarSalidaMaterialOutApiSchema, type RegistrarSalidaMaterialCreateApiType, type RegistrarSalidaMaterialOutApiType } from "./material.api.schema";


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
    RegistrarSalidaMaterialOutApiType[],
    ApiError,
    RegistrarSalidaMaterialCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/salidaMaterial", payload),
      inputSchema: RegistrarSalidaMaterialCreateApiSchema,
      outputSchema: RegistrarSalidaMaterialOutApiSchema.array(),
    }),
    onSuccess: () => {
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
