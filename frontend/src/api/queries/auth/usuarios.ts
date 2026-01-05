// src/lib/queries/usuarios.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../query/createQuery";
import api from "../../client";
import { UsuarioCreateSchema, UsuarioOutSchema, UsuarioUpdateSchema, type UsuarioCreateType, type UsuarioOutType, type UsuarioUpdateType } from "./usuarios.api.schema";
import type { ApiError } from "../../normalizeError";
import { createMutation } from "../../query/createMutation";
import { createDeleteMutation } from "../../query/createDeleteMutation";


/**
 * @description Hook para obtener la lista de usuarios.
 * @returns Un objeto de consulta de React Query con la lista de usuarios.
 */
export function useUsuariosList() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: createQuery({
      request: () => api.get("/usuarios"),
      schema: UsuarioOutSchema.array(),
    }),
  });
}

/**
 * @description Hook para obtener un usuario específico por su ID.
 * @param {number} id El ID del usuario a obtener.
 * @returns Un objeto de consulta de React Query con los datos del usuario.
 */
export function useGetUsuario(id: number) {
  return useQuery({
    queryKey: ["usuario", id],
    enabled: id > 0,
    queryFn: createQuery({
      request: () => api.get(`/usuarios/${id}`),
      schema: UsuarioOutSchema,
    }),
  });
}

/**
 * @description Hook para crear un nuevo usuario.
 * @returns Un objeto de mutación de React Query para crear un usuario.
 */
export function useCreateUsuario() {
  const qc = useQueryClient();

  return useMutation<UsuarioOutType, ApiError, UsuarioCreateType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/usuarios", payload, {
          headers: {
            "Idempotency-Key": crypto.randomUUID(),
          },
        }),
      inputSchema: UsuarioCreateSchema,
      outputSchema: UsuarioOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

/**
 * @description Hook para actualizar un usuario existente.
 * @param {number} id El ID del usuario a actualizar.
 * @returns Un objeto de mutación de React Query para actualizar el usuario.
 */
export function useUpdateUsuario(id: number) {
  const qc = useQueryClient();

  return useMutation<UsuarioOutType, ApiError, UsuarioUpdateType>({
    mutationFn: createMutation({
      request: (payload) => api.put(`/usuarios/${id}`, payload),
      inputSchema: UsuarioUpdateSchema,
      outputSchema: UsuarioOutSchema,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      qc.invalidateQueries({ queryKey: ["usuario", id] });
    },
  });
}

/**
 * @description Hook para eliminar un usuario.
 * @returns Un objeto de mutación de React Query para eliminar el usuario.
 */
export function useDeleteUsuario() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/usuarios/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
