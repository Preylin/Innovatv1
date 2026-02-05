import z from "zod";

const ProductoSchema = z.object({
  uuid_mercaderia: z.string(),
  codigo: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  dimension: z.string(),
  categoria: z.string(),
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

export const RegistrarSalidaMercaderiaOutApiSchema = z.object({
  id: z.number(),
  ruc: z.string(),
  cliente: z.string(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
  adicional: z.string().nullable(),
  moneda: z.string(),
  codigo: z.string(),
  uuid_mercaderia: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  dimension: z.string(),
  categoria: z.string(),
  serie: z.string(),
  cantidad: z.number(),
  valor: z.number(),
  image_byte: z.string(),
  created_at: z.iso.datetime(),
});

export type RegistrarSalidaMercaderiaOutApiType = z.infer<
  typeof RegistrarSalidaMercaderiaOutApiSchema
>;

export const RegistrarSalidaMercaderiaCreateApiSchema = z.object({
  ruc: z.string(),
  cliente: z.string(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
  adicional: z.string().nullable(),
  productos: z.array(ProductoSchema),
});

export type RegistrarSalidaMercaderiaCreateApiType = z.infer<
  typeof RegistrarSalidaMercaderiaCreateApiSchema
>;
