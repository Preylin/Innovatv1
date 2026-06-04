import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import {
  CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApi,
  CuentasPorCobrarDetalleOnetoOneReadVentasSchemaApi,
  RegistrarCobroSchemaApi,
  ReporteCntsPorCobrarSchemaApi,
  ReporteCobrosPagosActualSchemaApi,
  UpdateFechaPagoRetencionDetraccionSchemaApi,
  type CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApiType,
  type RegistrarCobroSchemaApiType,
  type UpdateFechaPagoRetencionDetraccionSchemaApiType,
} from "./api.schemaCntsCobrarTableReporte";
import type { ApiError } from "../../../../api/normalizeError";
import { createMutation } from "../../../../api/query/createMutation";
import { createDeleteMutation } from "../../../../api/query/createDeleteMutation";

export function useCuentasPorCobrarResumenMensualCaja(year: string) {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar_caja", year],
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () =>
        api.get("/tesoreria-cuentasporcobrar/resumen-mensual", {
          params: { year },
        }),
      schema: ReporteCntsPorCobrarSchemaApi.array(),
    }),
  });
}

// consulta individual del detalle de ventas por id
export function useCuentasPorCobrarIndividualVentas(id: number) {
  return useQuery({
    queryKey: ["detalle_cuenta_por_cobrar_individual_ventas", id],
    queryFn: createQuery({
      request: () =>
        api.get(`/tesoreria-cuentasporcobrar/detalle-ventas/${id}`),
      schema: CuentasPorCobrarDetalleOnetoOneReadVentasSchemaApi,
    }),
  });
}

// consulta de los registros de cobros realizados por cada venta
export function useCuentasPorCobrarDetalleMovimientoCajaVentas(id: number) {
  return useQuery({
    queryKey: ["detalle_cuenta_por_cobrar_moviento_caja_ventas", id],
    queryFn: createQuery({
      request: () =>
        api.get(`/tesoreria-cuentasporcobrar/detalle-caja-ventas/${id}`),
      schema: CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApi.array(),
    }),
  });
}

export function useCreateRegistroCobroMovimientoCajaVentas() {
  const qc = useQueryClient();

  return useMutation<
    CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApiType,
    ApiError,
    RegistrarCobroSchemaApiType
  >({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/tesoreria-cuentasporcobrar/registrar-cobro", payload),
      inputSchema: RegistrarCobroSchemaApi,
      outputSchema: CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApi,
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_cobrar_moviento_caja_ventas"],
      });
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_caja"],
      });
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_cobrar_individual_ventas"],
      });
    },
  });
}

// eliminar registro de cobro de ventas
export function useDeleteRegistoMovimientoCajaVentas() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/tesoreria-cuentasporcobrar/eliminar-cobro/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_cobrar_moviento_caja_ventas"],
      });
    },
  });
}

export function useUpdateFechaDetraccionRetencion(id: number) {
  const qc = useQueryClient();

  return useMutation<
    void,
    ApiError,
    UpdateFechaPagoRetencionDetraccionSchemaApiType
  >({
    mutationFn: createMutation({
      request: (payload) => api.put(`/tesoreria-cuentasporcobrar/actualizar-fecha-pago-detraccion-retencion/${id}`, payload),
      inputSchema: UpdateFechaPagoRetencionDetraccionSchemaApi,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["detalle_cuenta_por_cobrar_individual_ventas"] });
      
    },
  });
}


export function useReposteCobrosPagosActual() {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["reporte_cobro_pago_actual_tesoreria"],
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () =>
        api.get("/cajachica/reporte-cobro-pago-actual"),
      schema: ReporteCobrosPagosActualSchemaApi.array(),
    }),
  });
}
