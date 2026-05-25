import {useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../query/createQuery";
import api from "../../../../client";
import { HistorialVentasOutApiSchema } from "./historialVentas.api.schema";

export function useHistorialVentasListaList() {
  return useQuery({
    queryKey: ["historialVentas"],
    queryFn: createQuery({
      request: () => api.get("/administracion/historial/ventas"),
      schema: HistorialVentasOutApiSchema.array(),
    }),
  });
}

