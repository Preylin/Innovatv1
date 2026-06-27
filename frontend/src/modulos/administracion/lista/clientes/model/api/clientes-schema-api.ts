import z from "zod";


export const ClienteOutShortApiSchema = z.object({
  id: z.number(),
  nro_documento: z.string(),
  razon_social: z.string(),
});

export type ClienteOutShortApiType = z.infer<typeof ClienteOutShortApiSchema>;

export const UbicacionOutApiSchema = z.object({
  id: z.number(),
  ubicacion: z.string(),
});

export type UbicacionOutApiType = z.infer<typeof UbicacionOutApiSchema>;