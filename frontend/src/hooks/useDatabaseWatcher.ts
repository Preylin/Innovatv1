import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "../api/token";
import { API_URL } from "../api/client";
import { notification } from "antd";

export function useDatabaseWatcher() {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    let isComponentMounted = true; // Control para evitar reconexiones en componentes desmontados

    const connect = () => {
      const token = getToken();
      if (!token) {
        console.warn("No se encontró token, cancelando WebSocket.");
        return;
      }

      // Evitar duplicados si ya existe una conexión abierta
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl =
        API_URL.replace("http", "ws") + `/ws/notifications?token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => console.log("WebSocket conectado correctamente.");

      socket.onmessage = (event) => {
        if (event.data === "invalidate_all") {
          notification.info({
            message: "Se han sincronizado cambios recientes.",
            placement: "bottomRight",
            duration: 2,
            showProgress: true,
            pauseOnHover: true,
            
          });
          queryClient.invalidateQueries({
            predicate: (query) => query.state.status === "success",
          });
        }
      };

      socket.onclose = (e) => {
        if (isComponentMounted) {
          console.warn("WebSocket cerrado. Reintentando en 5s...", e.reason);
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      socket.onclose = (e) => {
        if (e.code === 1008) {
          console.error(
            "Token inválido o expirado. No se reintentará conexión.",
          );
          return;
        }

        if (isComponentMounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        // Quitamos el onclose para que el intento de reconexión no se dispare al desmontar
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [queryClient]); // queryClient es estable, así que esto solo corre al montar
}
