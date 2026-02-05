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
  image: z.array(
    z.object({
      image_byte: z.string(),
    }),
  ),
  ubicacion: z.string(),
});

export const RegistrarIngresoMercaderiaOutApiSchema = z.object({
  id: z.number(),
  ruc: z.string(),
  proveedor: z.string(),
  serieNumCP: z.string().nullable(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
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
  ubicacion: z.string(),
  created_at: z.iso.datetime(),
});

export type RegistrarIngresoMercaderiaOutApiType = z.infer<
  typeof RegistrarIngresoMercaderiaOutApiSchema
>;

export const RegistrarIngresoMercaderiaCreateApiSchema = z.object({
  ruc: z.string(),
  proveedor: z.string(),
  serieNumCP: z.string().nullable(),
  serieNumGR: z.string().nullable(),
  condicion: z.string(),
  fecha: z.iso.datetime(),
  moneda: z.string(),
  productos: z.array(ProductoSchema),
});

export type RegistrarIngresoMercaderiaCreateApiType = z.infer<
  typeof RegistrarIngresoMercaderiaCreateApiSchema
>;


export const StockActualOutApiSchema = z.object({
  codigo: z.string(),
  ingresos: z.number(),
  salidas: z.number(),
  stock_actual: z.number(),
});

export type StockActualType = z.infer<typeof StockActualOutApiSchema>;


export const StockActualDetalladoOutApiSchema = z.object({
  codigo: z.string(),
  uuid_registro: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  dimension: z.string(),
  categoria: z.string(),
  ubicacion: z.string(),
  plimit: z.number(),
  serie: z.string(),
  cantidad_inicial: z.number(),
  cantidad_salida: z.number(),
  stock_actual: z.number(),
  valor: z.number(),
  moneda: z.string(),
  fecha_ingreso: z.iso.datetime(),
  image_byte: z.string(),
});

export type StockActualDetalladoType = z.infer<
  typeof StockActualDetalladoOutApiSchema
>;

export const StockActualLimite = z.object({
  codigo: z.string(),
  name: z.string(),
  imagen1: z.string().nullable(),
  imagen2: z.string().nullable(),
  imagen3: z.string().nullable(),
  imagen4: z.string().nullable(),
  stock_actual: z.number(),
  plimit: z.number(),
});

export type StockActualLimiteType = z.infer<typeof StockActualLimite>;