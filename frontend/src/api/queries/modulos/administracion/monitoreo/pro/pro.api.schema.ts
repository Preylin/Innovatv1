import z from "zod";


export const ProOutApiSchema = z.object({
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

export type ProOutApiType = z.infer<typeof ProOutApiSchema>;

export const ProCreateApiSchema = z.object({
    name: z.string(),
    ubicacion: z.string(),
    inicio: z.iso.datetime(),
    fin: z.iso.datetime(),
    fact_rel: z.string().nullable(),
    adicional: z.string().nullable(),
    status: z.number()
})

export type ProCreateApiType = z.infer<typeof ProCreateApiSchema>;

export const ProUpdateApiSchema = z.object({
    name: z.string().optional(),
    ubicacion: z.string().optional(),
    inicio: z.iso.datetime().optional(),
    fin: z.iso.datetime().optional(),
    fact_rel: z.string().nullable().optional(),
    adicional: z.string().nullable().optional(),
    status: z.number().optional()
})

export type ProUpdateApiType = z.infer<typeof ProUpdateApiSchema>;
