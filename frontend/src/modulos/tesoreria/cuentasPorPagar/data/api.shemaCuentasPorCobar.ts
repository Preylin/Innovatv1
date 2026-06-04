import z from "zod";

export const CuentasPorPagarResumenMensualSchemaApiOut = z.object({
  id: z.number(),
  empresa: z.string(),
  detalle: z.string().nullable(), // Permitir null si la DB lo permite
  monto_esperado: z.number(),
  moneda: z.string(),
  dia_pago: z.number(),
  categoria: z.string().nullable(),
  estado_pago: z.enum(["TOTAL", "PARCIAL", "ADELANTADO", "PENDIENTE"]),
  monto_pagado_actual: z.number().optional().default(0),
  fecha_creacion: z.iso.datetime(),
});

export type CuentasPorPagarResumenMensualSchemaApiOutType = z.infer<
  typeof CuentasPorPagarResumenMensualSchemaApiOut
>;


export const CuentasPorPagarRegistroPagoCreateSchemaApi = z.object({
  obligacion_id: z.number(),
  monto_pagado: z.number(),
  mes_correspondiente: z.string(),
  comprobante: z.string().nullable(),
  estado_pago: z.enum(["TOTAL", "PARCIAL", "ADELANTADO"]),
  metodo_pago: z.string().nullable(),
  observaciones: z.string().nullable(),
});

export type CuentasPorPagarRegistroPagoCreateSchemaApiType = z.infer<
  typeof CuentasPorPagarRegistroPagoCreateSchemaApi
>;

export const CuentasPorPagarCreateApiSchema = z.object({
  empresa: z.string(),
  detalle: z.string().nullable(),
  monto_esperado: z.number(),
  moneda: z.string(),
  dia_pago: z.number(),
  categoria: z.string().nullable(),
});

export type CuentasPorPagarCreateApiType = z.infer<
  typeof CuentasPorPagarCreateApiSchema
>;


export const CuentasPorPagarUpdateApiSchema = z.object({
  empresa: z.string().optional(),
  detalle: z.string().nullable().optional(),
  monto_esperado: z.number().optional(),
  moneda: z.string().optional(),
  dia_pago: z.number().optional(),
  categoria: z.string().nullable().optional(),
});

export type CuentasPorPagarUpdateApiType = z.infer<
  typeof CuentasPorPagarUpdateApiSchema
>;


// schemas zod para cuentas por pagar eventuales

export const CuentasPorPagarEventualResumenMensualSchemaApiOut = z.object({
  id: z.number(),
  fecha_emision: z.coerce.date(),
  fecha_vencimiento: z.coerce.date(),
  empresa: z.string(),
  detalle: z.string(),
  monto_esperado: z.coerce.number(),
  monto_pagado: z.coerce.number(),
  moneda: z.string(),
  status_cobro: z.string(),
});

export type CuentasPorPagarEventualResumenMensualSchemaApiOutType = z.infer<
  typeof CuentasPorPagarEventualResumenMensualSchemaApiOut
>;

export const CuentasPorPagarEventualRegistrarApiSchema = z.object({
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  empresa: z.string(),
  detalle: z.string(),
  monto_esperado: z.number(),
  moneda: z.string(),
});

export type CuentasPorPagarEventualRegistrarApiType = z.infer<
  typeof CuentasPorPagarEventualRegistrarApiSchema
>;
export const CuentasPorPagarEventualActualizarApiSchema = z.object({
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  empresa: z.string(),
  detalle: z.string(),
  monto_esperado: z.number(),
  moneda: z.string(),
});

export type CuentasPorPagarEventualActualizarApiType = z.infer<
  typeof CuentasPorPagarEventualActualizarApiSchema
>;

export const MovimientoCajaCntsPagarEventualesSchemaApi = z.object({
  id: z.number(),
  fecha_operacion: z.coerce.date(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string(),
  glosa_pago: z.string(),
});

export type MovimientoCajaCntsPagarEventualesSchemaApiType = z.infer<
  typeof MovimientoCajaCntsPagarEventualesSchemaApi
>;

export const CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApi = z.object({
  id: z.number().int(),
  fecha_operacion: z.string().nullish(),
  lugar_salida: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string().nullish(),
  glosa_pago: z.string().nullish(),
});
export type CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApiType = z.infer<typeof CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApi>;

export const RegistrarPagoEventualesSchemaApi = z.object({
  obligacion_id: z.number().int(),
  fecha_operacion: z.string(),
  lugar_salida: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string(),
  status_cobro: z.string(),
  glosa_pago: z.string(),
});
export type RegistrarPagoEventualesSchemaApiType = z.infer<typeof RegistrarPagoEventualesSchemaApi>;