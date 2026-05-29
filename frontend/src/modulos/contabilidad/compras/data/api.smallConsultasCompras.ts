import { useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { GetYearsShemaApi } from "./api.schemaSmallConsultasCompras";


export function useYearsContabilidadCompras() {
  return useQuery({
    queryKey: ["years-contabilidad-compras"], 
    queryFn: createQuery({
      request: () => api.get("/contabilidad/compras/get-years"),
      schema: GetYearsShemaApi,
    }),
  });
}
