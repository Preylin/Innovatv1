import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/client";
import { createQuery } from "../../../../api/query/createQuery";
import { CuentasPorPagarCreateApiSchema, CuentasPorPagarResumenMensualSchemaApiOut, CuentasPorPagarUpdateApiSchema, type CuentasPorPagarCreateApiType, type CuentasPorPagarRegistroPagoCreateSchemaApiType, type CuentasPorPagarResumenMensualSchemaApiOutType, type CuentasPorPagarUpdateApiType } from "./api.shemaCuentasPorCobar";
import type { ApiError } from "../../../../api/normalizeError";
import { createMutation } from "../../../../api/query/createMutation";
import { createDeleteMutation } from "../../../../api/query/createDeleteMutation";


export function useCuentasPorPagarResumenMensual(mes: string) {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar", mes], 
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () => api.get("/cuentasporpagar/resumen-mensual", { params: { mes } }),
      schema: CuentasPorPagarResumenMensualSchemaApiOut.array(),
    }),
  });
}


export function useRegistrarPago(mes: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pago: CuentasPorPagarRegistroPagoCreateSchemaApiType) =>
      api.post("/cuentasporpagar/pagos", pago),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumen_mensual_cuentas_por_pagar", mes] });
    },
  });
}

export function useCreateObligacionPagar(mes: string) {
  const qc = useQueryClient();

  return useMutation<
    CuentasPorPagarResumenMensualSchemaApiOutType,
    ApiError,
    CuentasPorPagarCreateApiType
  >({
    mutationFn: createMutation({
      // Cambiado a /obligaciones para crear la maestra, no el pago
      request: (payload) => api.post("/cuentasporpagar/obligaciones", payload),
      inputSchema: CuentasPorPagarCreateApiSchema,
      outputSchema: CuentasPorPagarResumenMensualSchemaApiOut,
    }),
    onSuccess: () => {
      // Invalidamos el resumen mensual para que aparezca la nueva fila
      qc.invalidateQueries({ queryKey: ["resumen_mensual_cuentas_por_pagar", mes] });
    },
  });
}

export function useUpdateObligacionPagar(id: number) {
  const qc = useQueryClient();

  return useMutation<
    CuentasPorPagarResumenMensualSchemaApiOutType,
    ApiError,
    // Aquí el tipo que viene del formulario (sin id)
    Omit<CuentasPorPagarUpdateApiType, "id"> 
  >({
    mutationFn: createMutation({
      request: (payload) => 
        api.put(`/cuentasporpagar/actualizar-obligacion/${id}`, {
          ...payload,
          id: id, // <--- Inyectamos el ID aquí para cumplir con el esquema del Backend
        }),
      inputSchema: CuentasPorPagarUpdateApiSchema,
      outputSchema: CuentasPorPagarResumenMensualSchemaApiOut,
    }),
    onSuccess: () => {
      // Importante: Invalida la query para que el frontend se actualice solo
      qc.invalidateQueries({ queryKey: ["resumen_mensual_cuentas_por_pagar"] });
    },
  });
}

export function useDeleteObligacionPagar() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () => api.delete(`/cuentasporpagar/eliminar-obligacion/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumen_mensual_cuentas_por_pagar"] });
    },
  });

}