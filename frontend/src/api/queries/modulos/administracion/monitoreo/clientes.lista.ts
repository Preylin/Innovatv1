// src/lib/queries/Clientes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { ClienteCreateSchema, ClienteOutSchema, ClienteUpdateSchema, UbicacionCreateSchema, type ClienteCreateType, type ClienteOutType, type ClienteUpdateType, type UbicacionCreateType } from "./clientes.api.schemas";
import type { ApiError } from "../../../../normalizeError";
import { createMutation } from "../../../../query/createMutation";
import { createDeleteMutation } from "../../../../query/createDeleteMutation";


export function useClientesList() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: createQuery({
      request: () => api.get("/clientes"),
      schema: ClienteOutSchema.array(),
    }),
  });
}


export function useGetCliente(id: number) {
  return useQuery({
    queryKey: ["clientes", id],
    enabled: id > 0,
    queryFn: createQuery({
      request: () => api.get(`/clientes/${id}`),
      schema: ClienteOutSchema,
    }),
  });
}


export function useCreateCliente() {
  const qc = useQueryClient();

  return useMutation<ClienteOutType, ApiError, ClienteCreateType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/clientes", payload),
      inputSchema: ClienteCreateSchema,
      outputSchema: ClienteOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}


export function useUpdateCliente(id: number) {
  const qc = useQueryClient();

  return useMutation<ClienteOutType, ApiError, ClienteUpdateType>({
    mutationFn: createMutation({
      request: (payload) => api.put(`/clientes/${id}`, payload),
      inputSchema: ClienteUpdateSchema,
      outputSchema: ClienteOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["clientes", id] });
    },
  });
}


export function useDeleteCliente() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/clientes/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}



// UBICACIONES

export function useCreateUbicaciones() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, UbicacionCreateType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/ubicaciones", payload),
      inputSchema: UbicacionCreateSchema,
      
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}