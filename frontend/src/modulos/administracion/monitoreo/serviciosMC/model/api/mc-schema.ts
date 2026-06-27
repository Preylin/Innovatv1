import z from "zod";


export const McOutApiSchema = z.object({
  id: z.coerce.number(),
  cliente_id: z.coerce.number(),
  nro_documento: z.string(),
  razon_social: z.string(),
  ubicacion_id: z.coerce.number(),
  ubicacion: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  informe: z.string().nullable(),
  certificado: z.string().nullable(),
  encargado: z.string().nullable(),
  tecnico: z.string().nullable(),
  servicio: z.string().nullable(),
  incidencia: z.string().nullable(),
  estado: z.string(),

});

export type McOutApiType = z.infer<typeof McOutApiSchema>;

const McBaseApiSchema = z.object({
  cliente_id: z.number(),
  ubicacion_id: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  informe: z.string().nullable(),
  certificado: z.string().nullable(),
  encargado: z.string().nullable(),
  tecnico: z.string().nullable(),
  servicio: z.string().nullable(),
  incidencia: z.string().nullable(),
  estado: z.string(),
});

export const McUpdateApiSchema = McBaseApiSchema.extend({
});
export type McUpdateApiType = z.infer<typeof McUpdateApiSchema>;

export const McCreateApiSchema = McBaseApiSchema.extend({
});
export type McCreateApiType = z.infer<typeof McCreateApiSchema>; 

//actualizar estado
export const ActualizarEstadoSchema = z.object({
  estado: z.string(),
});

export type ActualizarEstadoSchemaType = z.infer<typeof ActualizarEstadoSchema>;