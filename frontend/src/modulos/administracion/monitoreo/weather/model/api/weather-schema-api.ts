import z from "zod";


export const WeatherOutApiSchema = z.object({
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

export type WeatherOutApiType = z.infer<typeof WeatherOutApiSchema>;

const WeatherBaseApiSchema = z.object({
  cliente_id: z.number(),
  ubicacion_id: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string(),
  adicional: z.string().nullable(),
});

export const WeatherUpdateApiSchema = WeatherBaseApiSchema.extend({
});
export type WeatherUpdateApiType = z.infer<typeof WeatherUpdateApiSchema>;

export const WeatherCreateApiSchema = WeatherBaseApiSchema.extend({
});
export type WeatherCreateApiType = z.infer<typeof WeatherCreateApiSchema>;

//actualizar estado
export const ActualizarEstadoSchema = z.object({
  estado: z.string(),
});

export type ActualizarEstadoSchemaType = z.infer<typeof ActualizarEstadoSchema>;


// importacion masiva
export const WeatherMasivaApiSchema = z.object({
  id: z.coerce.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string().nullable(),
  adicional: z.string().nullable(),
});
export type WeatherMasivaApiType = z.infer<typeof WeatherMasivaApiSchema>;

export const ProMasivaApiSchema = z.object({
  id: z.coerce.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string().nullable(),
  adicional: z.string().nullable(),
});
export type ProMasivaApiType = z.infer<typeof ProMasivaApiSchema>;

export const MCMasivaApiSchema = z.object({
  id: z.coerce.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  fact_relacionada: z.string().nullable(),
  informe: z.string().nullable(),
  certificado: z.string().nullable(),
  encargado: z.string().nullable(),
  tecnico: z.string().nullable(),
  servicio: z.string().nullable(),
  incidencia: z.string().nullable(),
  estado: z.string().nullable(),
});
export type MCMasivaApiType = z.infer<typeof MCMasivaApiSchema>;

export const ChipsMasivaApiSchema = z.object({
  id: z.coerce.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  numero_chip: z.string(),
  fact_relacionada: z.string().nullable(),
  estado: z.string().nullable(),
  adicional: z.string().nullable(),
});
export type ChipsMasivaApiType = z.infer<typeof ChipsMasivaApiSchema>;