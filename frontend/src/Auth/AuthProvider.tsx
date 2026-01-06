// src/Auth/AuthProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthState, useLogin, useLogout } from "../api/auth";
import { onTokenChange } from "../api/token";
import SpinAtom from "../components/atoms/spin/Spin";
import type { UsuarioOutType } from "../api/queries/auth/usuarios.api.schema";

/**
 * @typedef {object} AuthContextValue
 * @property {UsuarioOutType | null} user - El objeto de usuario autenticado, o null si no está autenticado.
 * @property {boolean} isAuthenticated - Verdadero si el usuario está autenticado, falso en caso contrario.
 * @property {boolean} loading - Verdadero si el estado de autenticación se está cargando actualmente.
 * @property {(email: string, password: string) => Promise<void>} login - Función para iniciar sesión del usuario.
 * @property {() => void} logout - Función para cerrar la sesión del usuario.
 * @property {() => Promise<void>} ensureReady - Una función que devuelve una promesa que se resuelve cuando la verificación de autenticación inicial está completa.
 */
export type AuthContextValue = {
  user: UsuarioOutType | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UsuarioOutType>;
  logout: () => void;
  ensureReady: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * Debe ser utilizado dentro de un `<AuthProvider>`.
 * @returns {AuthContextValue} El contexto de autenticación.
 * @throws {Error} Si se usa fuera de un `<AuthProvider>`.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth debe ser utilizado dentro de un <AuthProvider>");
  return ctx;
}

/**
 * Provee el estado de autenticación y funciones a sus componentes hijos.
 * Gestiona la sesión del usuario, incluyendo el inicio de sesión, cierre de sesión y cambios de token.
 *
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto de autenticación.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, refetch } = useAuthState();
  const loginMutation = useLogin();
  const logoutFn = useLogout();

  // readyRef: contiene una promesa que se resuelve cuando isLoading === false
  const readyRef = useRef<{
    promise: Promise<void>;
    resolve: (() => void) | null;
  } | null>(null);

  if (!readyRef.current) {
    let resolveFn: () => void;
    const p = new Promise<void>((res) => {
      resolveFn = res;
    });
    // resolveFn está garantizado por la ejecución síncrona anterior
    readyRef.current = { promise: p, resolve: resolveFn! };
  }

  useEffect(() => {
    // Solo resolvemos si ya no está cargando Y (si está autenticado, ya tenemos al usuario)
    const isReady = !isLoading && (isAuthenticated ? !!user : true);

    if (isReady) {
      readyRef.current?.resolve?.();
    }
  }, [isLoading, isAuthenticated, user]);

  // forzar un nuevo renderizado cuando cambia el token
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = onTokenChange(() => setTick((s) => s + 1));
    return () => {
      unsubscribe(); // se ejecuta SÓLO cuando React limpia el efecto
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UsuarioOutType> => {
      await loginMutation.mutateAsync({ email, password });
      const { data } = await refetch();
      if (!data) throw new Error("Usuario no disponible");
      return data;
    },
    [loginMutation, refetch]
  );

  const logout = useCallback(() => {
    logoutFn();
  }, [logoutFn]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      loading: isLoading,
      login,
      logout,
      ensureReady: () => readyRef.current!.promise,
    }),
    [user, isAuthenticated, isLoading, login, logout]
  );

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="h-screen w-screen grid place-content-center">
        <SpinAtom size="large">Cargando datos de sesión...</SpinAtom>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
