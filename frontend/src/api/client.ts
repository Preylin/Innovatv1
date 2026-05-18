// src/lib/Api/client.ts
import axios from "axios";
import axiosRetry from "axios-retry";
import { getToken } from "./token";
import { normalizeError } from "./normalizeError";

/**
 * La URL base para la API.
 * Se obtiene de la variable de entorno `VITE_API_URL`,
 */

export const API_URL = 
  (import.meta.env.VITE_API_BASE_URL as string);

/**
 * La instancia principal de axios para realizar solicitudes a la API.
 * Está configurada con la URL base y las cabeceras por defecto.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

/**
 * Configura la instancia de axios para reintentar automáticamente las solicitudes fallidas.
 * Reintentará hasta 2 veces con un retardo exponencial entre reintentos.
 * Solo reintenta si el error es por red o si la solicitud es idempotente (GET, HEAD, OPTIONS, DELETE).
 */
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) as boolean,
});

/**
 * Un interceptor que añade el token de autenticación a las cabeceras de la solicitud.
 * Si hay un token disponible, se añade a la cabecera `Authorization`.
 */
api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) {
    cfg.headers = cfg.headers || {};
    (cfg.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
  return cfg;
});

/**
 * Interceptor util para que los errores llegen limpios a la UI
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 1. Obtenemos el objeto estructurado gracias a tu función normalizeError
    const normalized = normalizeError(err);
    
    // 2. Extraemos los datos crudos del error de Axios por si acaso
    const backendData = err.response?.data;

    // --- CASO 1: Es un error de validación (Array de FastAPI/Pydantic/Zod) ---
    if (normalized.kind === "validation" && normalized.data?.length > 0) {
      err.message = normalized.data.map(d => d.msg).join(" | ");
    } 
    // --- CASO 2: El backend respondió con un objeto 'detail' que es un String directo ---
    else if (backendData && typeof backendData.detail === "string") {
      err.message = backendData.detail;
    } 
    // --- CASO 3: El backend respondió con una propiedad 'message' personalizada ---
    else if (backendData && typeof backendData.message === "string") {
      err.message = backendData.message;
    } 
    // --- CASO 4: Cualquier otro error (Error de red, 500 sin cuerpo, etc.) ---
    else {
      err.message = normalized.message;
    }

    // Asegurar que React Query mantenga la respuesta por si la necesitas en el futuro
    if (!err.response && (err as any).raw?.response) {
      err.response = (err as any).raw.response;
    }

    return Promise.reject(err);
  }
);

/**
 * Una función de obtención genérica para realizar solicitudes a la API.
 *
 * @template T El tipo esperado de los datos de respuesta.
 * @param {string} url La URL a la que se va a hacer la solicitud.
 * @param {object} [options] Las opciones para la solicitud.
 * @param {string} [options.method='GET'] El método HTTP a utilizar.
 * @param {any} [options.body] El cuerpo de la solicitud.
 * @returns {Promise<T>} Una promesa que se resuelve con los datos de la respuesta.
 */
export async function fetchJson<T = any>(
  url: string,
  options?: { method?: string; body?: any }
): Promise<T> {
  const { method = "GET", body } = options || {};
  const res = await api.request<T>({ url, method, data: body });
  return res.data;
}


export default api;
