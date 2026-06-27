import z from "zod";


export const ChipsOutApiSchema = z.object({
  id: z.coerce.number(),
  cliente_id: z.coerce.number(),
  nro_documento: z.string(),
  razon_social: z.string(),
  ubicacion_id: z.coerce.number(),
  ubicacion: z.string(),
  chip_id: z.coerce.number(),
  numero_chip: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string(),
  adicional: z.string().nullable(),
});

export type ChipsOutApiType = z.infer<typeof ChipsOutApiSchema>;

const ChipsBaseApiSchema = z.object({
  cliente_id: z.number(),
  ubicacion_id: z.number(),
  chip_id: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string(),
  adicional: z.string().nullable(),
});

export const ChipsUpdateApiSchema = ChipsBaseApiSchema.extend({
});
export type ChipsUpdateApiType = z.infer<typeof ChipsUpdateApiSchema>;

export const ChipsCreateApiSchema = ChipsBaseApiSchema.extend({
});
export type ChipsCreateApiType = z.infer<typeof ChipsCreateApiSchema>; 

//actualizar estado
export const ActualizarEstadoSchema = z.object({
  estado: z.string(),
});

export type ActualizarEstadoSchemaType = z.infer<typeof ActualizarEstadoSchema>;