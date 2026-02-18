import {useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../../query/createQuery";
import { HistorialComprasOutApiSchema } from "./historialCompras.api.schema";
import api from "../../../../../client";

export function useHistorialComprasListaList() {
  return useQuery({
    queryKey: ["historialCompras"],
    queryFn: createQuery({
      request: () => api.get("/historialCompras"),
      schema: HistorialComprasOutApiSchema.array(),
    }),
  });
}

