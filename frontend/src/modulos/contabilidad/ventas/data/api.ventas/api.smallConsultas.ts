import { useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../../api/query/createQuery";
import api from "../../../../../api/client";
import { GetYearsShemaApi } from "../api.schemasVentas/api.shemaSmallConsultas";

export function useYearsContabilidadVentas() {
  return useQuery({
    queryKey: ["years-contabilidad-ventas"], 
    queryFn: createQuery({
      request: () => api.get("/contabilidad/ventas/get-years"),
      schema: GetYearsShemaApi,
    }),
  });
}
