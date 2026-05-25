import z from "zod";

export const HistorialVentasOutApiSchema = z.object({
  id: z.number(),
  fecha_emision: z.coerce.date(),
  tipo_cp_codigo: z.string(),
  serie: z.string(),
  numero: z.string(),
  tipo_documento: z.string().nullish(),
  nro_documento: z.string().nullish(),
  razon_social: z.string().nullish(),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  total: z.coerce.number(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  categoria: z.string().nullish(),
  descripcion_comprobante: z.string().nullish(),
});

export type HistorialVentasOutApiType = z.infer<
  typeof HistorialVentasOutApiSchema
>;
