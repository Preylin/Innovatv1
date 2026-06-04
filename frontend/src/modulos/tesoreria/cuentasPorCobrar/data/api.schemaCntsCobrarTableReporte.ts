import { z } from "zod";

export const ReporteCntsPorCobrarSchemaApi = z.object({
  id: z.number(),
  fecha_emision: z.coerce.date(),
  fecha_vencimiento: z.coerce.date(),
  serie: z.string(),
  numero: z.string(),
  nro_documento: z.string(),
  razon_social: z.string(),
  total: z.coerce.number(),
  monto_pagado: z.coerce.number(),
  monto_retencion: z.coerce.number(),
  monto_detraccion: z.coerce.number(),
  fecha_pago_detraccion_retencion: z.string().nullish(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  status_cobro: z.string(),
  link_pdf: z.string().nullish(),
});

export type ReporteCntsPorCobrarSchemaApiType = z.infer<typeof ReporteCntsPorCobrarSchemaApi>;


export const CuentasPorCobrarDetalleOnetoOneReadVentasSchemaApi = z.object({
  id: z.number().int(),
  periodo: z.string(),
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  serie: z.string(),
  numero: z.string(),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  total: z.coerce.number(),
  tipo_cambio: z.coerce.number(),
  moneda: z.string(),
  monto_detraccion: z.coerce.number(),
  monto_retencion: z.coerce.number(),
  nro_orden_compra: z.string().nullish(),
  nro_guia_remision: z.string().nullish(),
  fecha_pago_detraccion_retencion: z.string().nullish(),
  descripcion_comprobante: z.string().nullish(),
});
export type CuentasPorCobrarDetalleOnetoOneReadSchemaApiType = z.infer<typeof CuentasPorCobrarDetalleOnetoOneReadVentasSchemaApi>;


export const CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApi = z.object({
  id: z.number().int(),
  fecha_pago: z.string().nullish(),
  lugar_ingreso: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string().nullish(),
  glosa_pago: z.string().nullish(),
});
export type CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApiType = z.infer<typeof CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApi>;

export const RegistrarCobroSchemaApi = z.object({
  venta_id: z.number().int(),
  fecha_pago: z.string(),
  lugar_ingreso: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string(),
  status_cobro: z.string(),
  glosa_pago: z.string().nullish(),
});
export type RegistrarCobroSchemaApiType = z.infer<typeof RegistrarCobroSchemaApi>;


export const UpdateFechaPagoRetencionDetraccionSchemaApi = z.object({
  fecha_pago_detraccion_retencion: z.string().nullish(),
});
export type UpdateFechaPagoRetencionDetraccionSchemaApiType = z.infer<typeof UpdateFechaPagoRetencionDetraccionSchemaApi>;


export const ReporteCobrosPagosActualSchemaApi = z.object({
  razon_social: z.string(),
  fecha_vencimiento: z.coerce.date(),
  moneda: z.string(),
  monto_total: z.coerce.number(),
  monto_pagado: z.coerce.number(),
  tabla: z.string(),
  is_check: z.boolean(),
});

export type ReporteCobrosPagosActualSchemaApiType = z.infer<typeof ReporteCobrosPagosActualSchemaApi>;
