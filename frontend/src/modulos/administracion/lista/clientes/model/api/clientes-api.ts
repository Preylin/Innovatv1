import { useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../../../api/query/createQuery";
import api from "../../../../../../api/client";
import { ClienteOutShortApiSchema, UbicacionOutApiSchema } from "./clientes-schema-api";

export function useClientesShortList() {
  return useQuery({
    queryKey: ["clientes-lista-short"],
    queryFn: createQuery({
      request: () => api.get("/clientes-global/mostrar-short"),
      schema: ClienteOutShortApiSchema.array(),
    }),
  });
}

export function useUbicacionesList() {
  return useQuery({
    queryKey: ["ubicaciones-lista"],
    queryFn: createQuery({
      request: () => api.get("/clientes-global/mostrar-ubicaciones-monitoreo"),
      schema: UbicacionOutApiSchema.array(),
    }),
  });
}