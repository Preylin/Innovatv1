import z from "zod";

export const CatalogoMaterialOutSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  tipo: z.string(),
  plimit: z.number(),
  dimension: z.string().nullable(),
  descripcion: z.string().nullable(),
  imagen1: z.string().nullable(),
  imagen2: z.string().nullable(),
  imagen3: z.string().nullable(),
  imagen4: z.string().nullable(),
  created_at: z.iso.datetime(),
});

export type CatalogoMaterialOutType = z.infer<
  typeof CatalogoMaterialOutSchema
>;

export const CatalogoMaterialCreateApiSchema = z.object({
  codigo: z.string(),
  name: z.string(),
  marca: z.string(),
  modelo: z.string(),
  medida: z.string(),
  tipo: z.string(),
  plimit: z.number(),
  dimension: z.string().nullable(),
  descripcion: z.string().nullable(),
  imagen1: z.string().nullable(),
  imagen2: z.string().nullable(),
  imagen3: z.string().nullable(),
  imagen4: z.string().nullable(),
});

export type CatalogoMaterialCreateApiType = z.infer<
  typeof CatalogoMaterialCreateApiSchema
>;

export const CatalogoMaterialUpdateApiSchema = z.object({
  codigo: z.string().optional(),
  name: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  medida: z.string().optional(),
  tipo: z.string().optional(),
  plimit: z.number().optional(),
  dimension: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  imagen1: z.string().nullable().optional(),
  imagen2: z.string().nullable().optional(),
  imagen3: z.string().nullable().optional(),
  imagen4: z.string().nullable().optional(),
});

export type CatalogoMaterialUpdateApiType = z.infer<
  typeof CatalogoMaterialUpdateApiSchema
>;
