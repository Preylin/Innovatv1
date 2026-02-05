import z from "zod";

const ProductoSchema = z.object({
  uuid_material: z.string(),
  codigo: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  dimension: z.string(),
  tipo: z.string(),
  serie: z.string(),
  cantidad: z.number(),
  valor: z.number(),
  moneda: z.string(),
  image: z.array(
    z.object({
      image_byte: z.string(),
    }),
  ),
});

export const RegistrarSalidaMaterialOutApiSchema = z.object({
  id: z.number(),
  ruc: z.string(),
  cliente: z.string(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
  moneda: z.string(),
  adicional: z.string().nullable(),
  codigo: z.string(),
  uuid_material: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  dimension: z.string(),
  tipo: z.string(),
  serie: z.string(),
  cantidad: z.number(),
  valor: z.number(),
  image_byte: z.string(),
  created_at: z.iso.datetime(),
});

export type RegistrarSalidaMaterialOutApiType = z.infer<
  typeof RegistrarSalidaMaterialOutApiSchema
>;

export const RegistrarSalidaMaterialCreateApiSchema = z.object({
  ruc: z.string(),
  cliente: z.string(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
  adicional: z.string().nullable(),
  productos: z.array(ProductoSchema),
});

export type RegistrarSalidaMaterialCreateApiType = z.infer<
  typeof RegistrarSalidaMaterialCreateApiSchema
>;
