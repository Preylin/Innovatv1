import z from "zod";

export const TablaComprasSchemaApiOut = z.object({
  id: z.number(),
  periodo: z.string(),
  fecha_emision: z.string(),
  fecha_vencimiento: z.string(),
  tipo_cp_codigo: z.string(),
  serie: z.string(),
  numero: z.string(),
  tipo_documento: z.string().nullable(),
  nro_documento: z.string().nullable(),
  razon_social: z.string().nullable(),
  base_imponible: z.coerce.number(),
  igv: z.coerce.number(),
  no_gravadas: z.coerce.number(),
  otros: z.coerce.number(),
  total: z.coerce.number(),
  moneda: z.string(),
  tipo_cambio: z.coerce.number(),
  descripcion_comprobante: z.string().nullable(),
  is_active: z.string(),
  link_pdf: z.string().nullable(),
});

export type TablaComprasSchemaApiOutType = z.infer<
  typeof TablaComprasSchemaApiOut
>;

export const TablaComprasSchemaApiCreate = TablaComprasSchemaApiOut.omit({
  id: true,
});
export type TablaComprasSchemaApiCreateType = z.infer<
  typeof TablaComprasSchemaApiCreate
>;

export const TablaComprasSchemaApiUpdate = TablaComprasSchemaApiOut.omit({
  id: true,
});
export type TablaComprasSchemaApiUpdateType = z.infer<
  typeof TablaComprasSchemaApiUpdate
>;
