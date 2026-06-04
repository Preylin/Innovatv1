import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/client";
import { createQuery } from "../../../../api/query/createQuery";
import {
  CuentasPorPagarCreateApiSchema,
  CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApi,
  CuentasPorPagarEventualRegistrarApiSchema,
  CuentasPorPagarEventualResumenMensualSchemaApiOut,
  CuentasPorPagarResumenMensualSchemaApiOut,
  CuentasPorPagarUpdateApiSchema,
  RegistrarPagoEventualesSchemaApi,
  type CuentasPorPagarCreateApiType,
  type CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApiType,
  type CuentasPorPagarEventualRegistrarApiType,
  type CuentasPorPagarRegistroPagoCreateSchemaApiType,
  type CuentasPorPagarResumenMensualSchemaApiOutType,
  type CuentasPorPagarUpdateApiType,
  type RegistrarPagoEventualesSchemaApiType,
} from "./api.shemaCuentasPorCobar";
import type { ApiError } from "../../../../api/normalizeError";
import { createMutation } from "../../../../api/query/createMutation";
import { createDeleteMutation } from "../../../../api/query/createDeleteMutation";

export function useCuentasPorPagarResumenMensual(mes: string) {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar", mes],
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () =>
        api.get("/cuentasporpagar/resumen-mensual", { params: { mes } }),
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
      queryClient.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar", mes],
      });
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
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar", mes],
      });
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

// hooks para cuenta spor pagar eventuales

export function useCuentasPorPagarEventualList() {
  return useQuery({
    // Agregamos el mes a la queryKey para que se refresque al cambiar de mes
    queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"],
    queryFn: createQuery({
      // Pasamos el mes como query param al backend
      request: () => api.get("/cuentasporpagar/resumen-eventuales"),
      schema: CuentasPorPagarEventualResumenMensualSchemaApiOut.array(),
    }),
  });
}

export function useCuentasPorPagarEventualCreate() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, CuentasPorPagarEventualRegistrarApiType>({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/cuentasporpagar/registrar-pago-eventuales", payload),
      inputSchema: CuentasPorPagarEventualRegistrarApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"],
      });
    },
  });
}

export function useRegistroMovimientoCajaEventuales(id: number) {
  return useQuery({
    queryKey: ["detalle_cuenta_por_pagar_moviento_caja_eventuales", id],
    queryFn: createQuery({
      request: () => api.get(`/cuentasporpagar/detalle-caja-eventuales/${id}`),
      schema:
        CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApi.array(),
    }),
  });
}

export function useCreateRegistroCobroMovimientoCajaEventuales() {
  const qc = useQueryClient();

  return useMutation<
    CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApiType,
    ApiError,
    RegistrarPagoEventualesSchemaApiType
  >({
    mutationFn: createMutation({
      request: (payload) =>
        api.post("/cuentasporpagar/registrar-pago-unico-eventuales", payload),
      inputSchema: RegistrarPagoEventualesSchemaApi,
      outputSchema:
        CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApi,
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_moviento_caja_eventuales"],
      });
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"],
      });
    },
  });
}


export function useUpdateObligacionPagarEventuales(id: number) {
  const qc = useQueryClient();

  return useMutation<
    void,
    ApiError,
    // Aquí el tipo que viene del formulario (sin id)
    CuentasPorPagarEventualRegistrarApiType
  >({
    mutationFn: createMutation({
      request: (payload) =>
        api.put(`/cuentasporpagar/actualizar-registro-eventuales/${id}`, {
          ...payload,
          id: id, // <--- Inyectamos el ID aquí para cumplir con el esquema del Backend
        }),
      inputSchema: CuentasPorPagarEventualRegistrarApiSchema,
      outputSchema: undefined,
    }),
    onSuccess: () => {
      // Importante: Invalida la query para que el frontend se actualice solo
      qc.invalidateQueries({ queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"] });
    },
  });
}

export function useDeleteRegistoMovimientoCajaEventual() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/cuentasporpagar/eliminar-pago-eventuales/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_moviento_caja_eventuales"],
      });
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"],
      });
    },
  });
}

export function useDeleteRegistoEventuales() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (id: number) =>
      createDeleteMutation({
        request: () =>
          api.delete(`/cuentasporpagar/eliminar-obligacion-eventuales/${id}`),
      })(),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["detalle_cuenta_por_pagar_moviento_caja_eventuales"],
      });
      qc.invalidateQueries({
        queryKey: ["resumen_mensual_cuentas_por_pagar_eventuales"],
      });
    },
  });
}