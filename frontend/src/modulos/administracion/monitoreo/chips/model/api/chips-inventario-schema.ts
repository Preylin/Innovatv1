import z from "zod";


export const ChipInventarioOutApiSchema = z.object({
  id: z.number(),
  numero_chip: z.string(),
  iccid: z.string().nullable(),
  operador: z.string().nullable(),
  plan: z.string().nullable(),
  fecha_activacion: z.string().nullable(),
  fecha_instalacion: z.string().nullable(),
  adicional: z.string().nullable(),
});

export type ChipInventarioOutApiType = z.infer<typeof ChipInventarioOutApiSchema>;

const ChipInventarioBaseApiSchema = z.object({
  numero_chip: z.string(),
  iccid: z.string().nullable(),
  operador: z.string().nullable(),
  plan: z.string().nullable(),
  fecha_activacion: z.string().nullable(),
  fecha_instalacion: z.string().nullable(),
  adicional: z.string().nullable(),
});

export const ChipInventarioUpdateApiSchema = ChipInventarioBaseApiSchema.extend({
});
export type ChipInventarioUpdateApiType = z.infer<typeof ChipInventarioUpdateApiSchema>;

export const ChipInventarioCreateApiSchema = ChipInventarioBaseApiSchema.extend({
});
export type ChipInventarioCreateApiType = z.infer<typeof ChipInventarioCreateApiSchema>; 

//actualizar estado
// En tu archivo de esquemas (chips-inventario-schema.ts)
export const ChipInventarioDeleteApiSchema = z.object({
  id: z.number(),
  is_active: z.boolean(),
});

export type ChipInventarioDeleteApiType = z.infer<typeof ChipInventarioDeleteApiSchema>;
