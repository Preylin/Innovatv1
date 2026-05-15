import { useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { ReporteCntsPorCobrarSchemaApi } from "./api.schemaCntsCobrarTableReporte";


export function useCuentasPorCobrarResumenMensualCaja(periodo: string) {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar_caja", periodo], 
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () => api.get("/tesoreria-cuentasporcobrar/resumen-mensual", { params: { periodo } }),
      schema: ReporteCntsPorCobrarSchemaApi.array(),
    }),
  });
}

