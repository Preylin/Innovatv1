// src/lib/Api/auth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { fetchJson } from "./client";
import { getToken, setToken, clearToken, onTokenChange } from "./token";
import { LoginInSchema, TokenOutSchema, type LoginInType, type TokenOutType } from "./auth.api.schema";
import { UsuarioOutSchema, type UsuarioOutType } from "./queries/auth/usuarios.api.schema";
import { ApiError, normalizeError } from "./normalizeError";


/**
 * @description
 * Busca los datos del usuario autenticado actualmente.
 * @returns {Promise<UsuarioOut | null>} Los datos del usuario o null si no hay token.
 */
export async function fetchMe(): Promise<UsuarioOutType | null> {
  const token = getToken();
  if (!token) return null;
  const data = await fetchJson<unknown>("/auth/me");
  return UsuarioOutSchema.parse(data);
}

/**
 * @description
 * Hook para gestionar el estado de autenticación del usuario.
 * Proporciona información sobre el usuario, si está autenticado y el estado de la carga.
 */
export function useAuthState() {
  const q = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: !!getToken(),
    retry: false,
  });

  return {
    user: q.data ?? null,
    isAuthenticated: !!q.data,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    refetch: q.refetch,
  };
}

/**
 * @description
 * Hook para gestionar manejar el proceso de login y la actualización del estado de autenticación.
 * @returns Un objeto de mutación de React Query para realizar el inicio de sesión.
 */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation<TokenOutType, ApiError, LoginInType>({
    mutationFn: async (payload) => {
      try {
        // Validar el input (frontera interna)
        const validPayload = LoginInSchema.parse(payload);
        // Request HTTP
        const res = await api.post("/auth/login", validPayload);
        // Validar respuesta (frontera externa)
        const token = TokenOutSchema.parse(res.data);
        // Side-effects
        setToken(token.access_token);
        await qc.invalidateQueries({ queryKey: ["auth", "me"] });
        return token;
      } catch (err) {
        // Transformar cualquier error a ApiError
        if (err instanceof ApiError) throw err; // ya es ApiError
        throw new ApiError({
          ...normalizeError(err),
        });
      }
    },
  });
}

/**
 * @description
 * Hook para gestionar el cierre de sesión del usuario.
 * Limpia el token y el cache de React Query.
 * @returns Una función para cerrar la sesión.
 */
export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearToken();
    qc.clear();
  };
}

/**
 * @description
 * Exporta la función onTokenChange para que pueda ser utilizada en otros módulos.
 */
export { onTokenChange };
