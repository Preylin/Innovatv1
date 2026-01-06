// src/lib/Api/auth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./client";
import { getToken, setToken, clearToken, onTokenChange } from "./token";
import { LoginInSchema, TokenOutSchema, type LoginInType, type TokenOutType } from "./auth.api.schema";
import { UsuarioOutSchema, type UsuarioOutType } from "./queries/auth/usuarios.api.schema";
import { ApiError } from "./normalizeError";


/**
 * @description
 * Busca los datos del usuario autenticado actualmente.
 * @returns {Promise<UsuarioOut | null>} Los datos del usuario o null si no hay token.
 */
export async function fetchMe(): Promise<UsuarioOutType | null> {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Usamos api directamente para asegurar que pase por el interceptor con el token
    const res = await api.get("/auth/me"); 
    return UsuarioOutSchema.parse(res.data);
  } catch (e) {
    console.error("Error en fetchMe:", e);
    clearToken(); // Si el token no sirve, lo limpiamos
    return null;
  }
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
      const validPayload = LoginInSchema.parse(payload);
      const res = await api.post("/auth/login", validPayload);
      const token = TokenOutSchema.parse(res.data);
      
      setToken(token.access_token);
      
      // CAMBIO CLAVE: Ejecutar el fetch de "me" inmediatamente y esperar el resultado
      // Esto asegura que cuando la mutación termine, la caché ya tenga al usuario.
      await qc.fetchQuery({ 
        queryKey: ["auth", "me"], 
        queryFn: fetchMe 
      });
      
      return token;
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
