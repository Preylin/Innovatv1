import { z } from "zod";

export const ReporteCntsPorCobrarSchemaApi = z.object({
  id: z.number(),
  periodo: z.string(),
  fecha_emision: z.coerce.date(),
  fecha_vencimiento: z.coerce.date().nullish(),
  nro_documento: z.string(),
  razon_social: z.string(),
  total: z.coerce.number(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  fecha_pago: z.coerce.date().nullish(),
  monto_pagado: z.coerce.number(),
  status_cobro: z.string(),
  link_pdf: z.string().nullish(),
});

export type ReporteCntsPorCobrarSchemaApiType = z.infer<typeof ReporteCntsPorCobrarSchemaApi>;