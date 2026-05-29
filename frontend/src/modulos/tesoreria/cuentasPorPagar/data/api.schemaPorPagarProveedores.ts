import { z } from "zod";

export const ReporteCntsPorPagarProveedoresSchemaApi = z.object({
  id: z.number(),
  fecha_emision: z.coerce.date(),
  fecha_vencimiento: z.coerce.date(),
  serie: z.string(),
  numero: z.string(),
  nro_documento: z.string(),
  razon_social: z.string(),
  total: z.coerce.number(),
  monto_pagado: z.coerce.number(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  status_cobro: z.string(),
  link_pdf: z.string().nullish(),
});

export type ReporteCntsPorPagarProveedoresSchemaApiType = z.infer<typeof ReporteCntsPorPagarProveedoresSchemaApi>;


export const CuentasPorPagarProveedoresDetalleOnetoOneReadVentasSchemaApi = z.object({
  id: z.number().int(),
  periodo: z.string(),
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  serie: z.string(),
  numero: z.string(),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  no_gravadas: z.coerce.number(),
  otros: z.coerce.number(),
  total: z.coerce.number(),
  tipo_cambio: z.coerce.number(),
  moneda: z.string(),
  descripcion_comprobante: z.string().nullish(),
});
export type CuentasPorPagarProveedoresDetalleOnetoOneReadSchemaApiType = z.infer<typeof CuentasPorPagarProveedoresDetalleOnetoOneReadVentasSchemaApi>;


export const CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApi = z.object({
  id: z.number().int(),
  fecha_pago: z.string().nullish(),
  lugar_salida: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string().nullish(),
  glosa_pago: z.string().nullish(),
});
export type CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApiType = z.infer<typeof CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApi>;

export const RegistrarPagoProveedoresSchemaApi = z.object({
  compra_id: z.number().int(),
  fecha_pago: z.string(),
  lugar_salida: z.string().nullish(),
  monto_pagado: z.coerce.number(),
  medio_pago: z.string(),
  status_cobro: z.string(),
  glosa_pago: z.string().nullish(),
});
export type RegistrarPagoProveedoresSchemaApiType = z.infer<typeof RegistrarPagoProveedoresSchemaApi>;
