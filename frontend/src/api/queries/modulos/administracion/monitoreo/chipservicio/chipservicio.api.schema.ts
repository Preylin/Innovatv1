import z from "zod";

export const ChipServicioOutApiSchema = z.object({
  id: z.number(),
  name: z.string(),
  ubicacion: z.string(),
  numero: z.string(),
  operador: z.string(),
  plan: z.string(),
  inicio: z.iso.datetime(),
  fin: z.iso.datetime(),
  fact_rel: z.string().nullable(),
  adicional: z.string().nullable(),
  status: z.number(),
  created_at: z.iso.datetime(),
});

export type ChipServicioOutApiType = z.infer<typeof ChipServicioOutApiSchema>;


export const ChipServicioCreateApiSchema = z.object({
  name: z.string(),
  ubicacion: z.string(),
  numero: z.string(),
  operador: z.string(),
  plan: z.string(),
  inicio: z.iso.datetime(),
  fin: z.iso.datetime(),
  fact_rel: z.string(),
  adicional: z.string(),
  status: z.number(),
});

export type ChipServicioCreateApiType = z.infer<typeof ChipServicioCreateApiSchema>;

export const ChipServicioUpdateApiSchema = z.object({
  name: z.string().optional(),
  ubicacion: z.string().optional(),
  numero: z.string().optional(),
  operador: z.string().optional(),
  plan: z.string().optional(),
  inicio: z.iso.datetime().optional(),
  fin: z.iso.datetime().optional(),
  fact_rel: z.string().optional(),
  adicional: z.string().optional(),
  status: z.number().optional(),
});

export type ChipServicioUpdateApiType = z.infer<typeof ChipServicioUpdateApiSchema>;

