import z from "zod";


export const ProOutApiSchema = z.object({
  id: z.coerce.number(),
  cliente_id: z.coerce.number(),
  nro_documento: z.string(),
  razon_social: z.string(),
  ubicacion_id: z.coerce.number(),
  ubicacion: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string(),
  adicional: z.string().nullable(),
});

export type ProOutApiType = z.infer<typeof ProOutApiSchema>;

const ProBaseApiSchema = z.object({
  cliente_id: z.number(),
  ubicacion_id: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string(),
  adicional: z.string().nullable(),
});

export const ProUpdateApiSchema = ProBaseApiSchema.extend({
});
export type ProUpdateApiType = z.infer<typeof ProUpdateApiSchema>;

export const ProCreateApiSchema = ProBaseApiSchema.extend({
});
export type ProCreateApiType = z.infer<typeof ProCreateApiSchema>;

//actualizar estado
export const ActualizarEstadoSchema = z.object({
  estado: z.string(),
});

export type ActualizarEstadoSchemaType = z.infer<typeof ActualizarEstadoSchema>;