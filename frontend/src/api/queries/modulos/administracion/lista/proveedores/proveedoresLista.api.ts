import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import api from "../../../../../client";
import { createMutation } from "../../../../../query/createMutation";

import { ApiError } from "../../../../../normalizeError";
import {
  ProveedoresListaCreateApiSchema,
  ProveedoresListaOutApiSchema,
  ProveedoresListaUpdateApiSchema,
  type ProveedoresListaCreateApiType,
  type ProveedoresListaOutApiType,
  type ProveedoresListaUpdateApiType,
} from "./provedoresLista.api.schema";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";

export function useProveedoresListaList() {
  return useQuery({
    queryKey: ["proveedoresLista"],
    queryFn: createQuery({
      request: () => api.get("/proveedoresGerenciaInicio"),
      schema: ProveedoresListaOutApiSchema.array(),
    }),
  });
}

export function useCreateProveedoresLista() {
  const qc = useQueryClient();

  return useMutation<
    ProveedoresListaOutApiType,
    ApiError,
    ProveedoresListaCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/proveedoresGerenciaInicio", payload),
      inputSchema: ProveedoresListaCreateApiSchema,
      outputSchema: ProveedoresListaOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ProveedoresLista"] });
    },
  });
}

export function useUpdateProveedoresLista(id: number) {
  const qc = useQueryClient();

  return useMutation<
    ProveedoresListaOutApiType,
    ApiError,
    ProveedoresListaUpdateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/proveedoresGerenciaInicio/${id}`, payload),
      inputSchema: ProveedoresListaUpdateApiSchema,
      outputSchema: ProveedoresListaOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proveedoresLista"] });
    },
  });
}

export function useDeleteProveedoresLista() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/proveedoresGerenciaInicio/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proveedoresLista"] });
    },
  });
}
