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