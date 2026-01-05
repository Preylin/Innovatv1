/**
 * La clave utilizada para almacenar el token de acceso en el localStorage.
 */
const TOKEN_KEY = '__app_access_token_v1';

type Subscriber = () => void;

/**
 * Un conjunto de suscriptores que se ejecutan cuando cambia el token.
 */
const subs = new Set<Subscriber>();

/**
 * Obtiene el token de acceso del localStorage.
 * @returns {string | null} El token de acceso o null si no se encuentra.
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Guarda el token de acceso en el localStorage y notifica a los suscriptores.
 * @param {string} token El token de acceso a guardar.
 */
export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    subs.forEach((s) => s());
  } catch (e) {
    console.error('setToken error', e);
  }
}

/**
 * Elimina el token de acceso del localStorage y notifica a los suscriptores.
 */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    subs.forEach((s) => s());
  } catch (e) {
    console.error('clearToken error', e);
  }
}

/**
 * Permite suscribirse a los cambios del token de acceso.
 * @param {Subscriber} cb La función de devolución de llamada a ejecutar cuando cambia el token.
 * @returns {() => void} Una función para cancelar la suscripción.
 */
export function onTokenChange(cb: Subscriber) {
  subs.add(cb);
  return () => subs.delete(cb);
}
