import z from "zod";


export const WeatherOutApiSchema = z.object({
    id: z.number(),
    name: z.string(),
    ubicacion: z.string(),
    inicio: z.iso.datetime(),
    fin: z.iso.datetime(),
    fact_rel: z.string().nullable(),
    adicional: z.string().nullable(),
    status: z.number(),
    created_at: z.iso.datetime(),
})

export type WeatherOutApiType = z.infer<typeof WeatherOutApiSchema>;

export const WeatherCreateApiSchema = z.object({
    name: z.string(),
    ubicacion: z.string(),
    inicio: z.iso.datetime(),
    fin: z.iso.datetime(),
    fact_rel: z.string().nullable(),
    adicional: z.string().nullable(),
    status: z.number()
})

export type WeatherCreateApiType = z.infer<typeof WeatherCreateApiSchema>;

export const WeatherUpdateApiSchema = z.object({
    name: z.string().optional(),
    ubicacion: z.string().optional(),
    inicio: z.iso.datetime().optional(),
    fin: z.iso.datetime().optional(),
    fact_rel: z.string().nullable().optional(),
    adicional: z.string().nullable().optional(),
    status: z.number().optional()
})

export type WeatherUpdateApiType = z.infer<typeof WeatherUpdateApiSchema>;
