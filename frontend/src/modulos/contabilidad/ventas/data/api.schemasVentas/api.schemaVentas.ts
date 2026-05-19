import z from "zod";

export const TablaVentasSchemaApiOut = z.object({
  id: z.number(),
  periodo: z.string(),
  fecha_emision: z.coerce.date(),
  fecha_vencimiento: z.coerce.date().nullable(),
  tipo_cp_codigo: z.string(),
  serie: z.string(),
  numero: z.string(),
  tipo_documento: z.string().nullable(),
  nro_documento: z.string().nullable(),
  razon_social: z.string().nullable(),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  total: z.coerce.number(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  categoria: z.string().nullable(),
  descripcion_comprobante: z.string().nullable(),
  is_active: z.string(),
  link_pdf: z.string().nullable(),
});

export type TablaVentasSchemaApiOutType = z.infer<
  typeof TablaVentasSchemaApiOut
>;

export const TablaVentasSchemaApiCreate = TablaVentasSchemaApiOut.omit({
  id: true,
});
export type TablaVentasSchemaApiCreateType = z.infer<
  typeof TablaVentasSchemaApiCreate
>;

export const TablaVentasSchemaApiUpdate = TablaVentasSchemaApiOut.omit({
  id: true,
});
export type TablaVentasSchemaApiUpdateType = z.infer<
  typeof TablaVentasSchemaApiUpdate
>;
