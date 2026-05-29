import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuery } from "../../../../api/query/createQuery";
import api from "../../../../api/client";
import { CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApi, CuentasPorPagarProveedoresDetalleOnetoOneReadVentasSchemaApi, RegistrarPagoProveedoresSchemaApi, ReporteCntsPorPagarProveedoresSchemaApi, type CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApiType, type RegistrarPagoProveedoresSchemaApiType } from "./api.schemaPorPagarProveedores";
import type { ApiError } from "../../../../api/normalizeError";
import { createDeleteMutation } from "../../../../api/query/createDeleteMutation";
import { createMutation } from "../../../../api/query/createMutation";



export function useCuentasPorPagarProveedoresResumenMensual(year: string) {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar_proveedores", year],
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () =>
        api.get("/cuentasporpagar/resumen-proveedores", {
          params: { year },
        }),
      schema: ReporteCntsPorPagarProveedoresSchemaApi.array(),
    }),
  });
}


// consulta individual del detalle de ventas por id
export function useCuentasPorPagarIndividualComprasProveedores(id: number) {
  return useQuery({
    queryKey: ["detalle_cuenta_por_pagar_individual_ventas", id],
    queryFn: createQuery({
      request: () =>
        api.get(`/cuentasporpagar/detalle-compras-proveedores/${id}`),
      schema: CuentasPorPagarProveedoresDetalleOnetoOneReadVentasSchemaApi,
    }),
  });
}

// consulta de los registros de cobros realizados por cada venta
export function useCuentasPorpagarDetalleMovimientoCajaCompras(id: number) {
  return useQuery({
    queryKey: ["detalle_cuenta_por_pagar_moviento_caja_ventas", id],
    queryFn: createQuery({
      request: () =>
        api.get(`/cuentasporpagar/detalle-caja-compras-proveedores/${id}`),
      schema: CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApi.array(),
    }),
  });
}

export function useCreateRegistroCobroMovimientoCajaCompras() {
  const qc = useQueryClient();

  return useMutation<
    CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApiType,
    ApiError,
    RegistrarPagoProveedoresSchemaApiType
  >({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/cuentasporpagar/registrar-pago-proveedores", payload),
      inputSchema: RegistrarPagoProveedoresSchemaApi,
      outputSchema: CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApi,
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_moviento_caja_ventas"],
      });
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_proveedores"],
      });
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_individual_ventas"],
      });
    },
  });
}

// eliminar registro de cobro de ventas
export function useDeleteRegistoMovimientoCajaCompras() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/cuentasporpagar/eliminar-cobro-proveedores/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_moviento_caja_ventas"],
      });
    },
  });
}