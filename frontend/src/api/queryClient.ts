// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

/**
 * @description
 * Instancia del cliente de React Query con configuración por defecto para toda la aplicación.
 *
 * @property {object} defaultOptions - Opciones predeterminadas para las consultas y mutaciones.
 * @property {object} defaultOptions.queries - Opciones para las consultas (queries).
 * @property {number} defaultOptions.queries.staleTime - 3 minutos. Tiempo que los datos en caché se consideran "frescos" y no se volverán a solicitar.
 * @property {number} defaultOptions.queries.gcTime - 30 minutos. Tiempo que los datos inactivos permanecen en caché antes de ser eliminados por el recolector de basura.
 * @property {number} defaultOptions.queries.retry - 1 reintento. Número de veces que se reintentará una consulta fallida.
 * @property {boolean} defaultOptions.queries.refetchOnWindowFocus - Deshabilitado. Evita que se vuelvan a solicitar datos automáticamente cuando la ventana del navegador recupera el foco.
 * @property {boolean} defaultOptions.queries.refetchOnReconnect - Habilitado. Vuelve a solicitar datos automáticamente si se recupera la conexión de red.
 *@property {boolean} defaultOptions.queries.retryOnMount - Desabilitado. Por defecto no refetchear solo por montar (evita refetches innecesarios)

 * @property {object} defaultOptions.mutations - Opciones para las mutaciones (mutations).
 * @property {number} defaultOptions.mutations.retry - Deshabilitado. Las mutaciones fallidas no se reintentarán.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        staleTime: 3 * 60 * 1000, 
        retry: 1,
        refetchOnWindowFocus: false,
        retryOnMount: false,
        },
        mutations: {
        retry: 0,
        },
    },
});
