import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import api from "../../../../../client";
import { createMutation } from "../../../../../query/createMutation";

import { ApiError } from "../../../../../normalizeError";
import {
  ClientesListaCreateApiSchema,
  ClientesListaOutApiSchema,
  ClientesListaUpdateApiSchema,
  type ClientesListaCreateApiType,
  type ClientesListaOutApiType,
  type ClientesListaUpdateApiType,
} from "./clientesLista.api.schema";
import { createDeleteMutation } from "../../../../../query/createDeleteMutation";

export function useClientesListaList() {
  return useQuery({
    queryKey: ["clientesLista"],
    queryFn: createQuery({
      request: () => api.get("/clientesGerenciaInicio"),
      schema: ClientesListaOutApiSchema.array(),
    }),
  });
}

export function useCreateClientesLista() {
  const qc = useQueryClient();

  return useMutation<
    ClientesListaOutApiType,
    ApiError,
    ClientesListaCreateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.post("/clientesGerenciaInicio", payload),
      inputSchema: ClientesListaCreateApiSchema,
      outputSchema: ClientesListaOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientesLista"] });
    },
  });
}

export function useUpdateClientesLista(id: number) {
  const qc = useQueryClient();

  return useMutation<
    ClientesListaOutApiType,
    ApiError,
    ClientesListaUpdateApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/clientesGerenciaInicio/${id}`, payload),
      inputSchema: ClientesListaUpdateApiSchema,
      outputSchema: ClientesListaOutApiSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientesLista"] });
    },
  });
}

export function useDeleteClientesLista() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/clientesGerenciaInicio/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientesLista"] });
    },
  });
}
