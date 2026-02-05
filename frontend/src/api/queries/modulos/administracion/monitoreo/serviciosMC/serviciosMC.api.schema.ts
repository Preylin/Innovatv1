import z from "zod";

export const ServiciosMCOutApiSchema = z.object({
    id: z.number(),
    empresa: z.string(),
    ubicacion: z.string(),
    inicio: z.iso.datetime(),
    fin: z.iso.datetime(),
    servicio: z.string(),
    informe: z.string().nullable(),
    certificado: z.string().nullable(),
    encargado: z.string().nullable(),
    tecnico: z.string().nullable(),
    incidencia: z.string().nullable(),
    status: z.number(),
    created_at: z.iso.datetime(),
});

export type ServiciosMCOutApiType = z.infer<typeof ServiciosMCOutApiSchema>;

export const ServiciosMcCreateApiSchema = z.object({
    empresa: z.string(),
    ubicacion: z.string(),
    inicio: z.iso.datetime(),
    fin: z.iso.datetime(),
    servicio: z.string(),
    informe: z.string().nullable(),
    certificado: z.string().nullable(),
    encargado: z.string().nullable(),
    tecnico: z.string().nullable(),
    incidencia: z.string().nullable(),
    status: z.number(),
});

export type ServiciosMcCreateApiType = z.infer<typeof ServiciosMcCreateApiSchema>;

export const ServiciosMcUpdateApiSchema = z.object({
    empresa: z.string().optional(),
    ubicacion: z.string().optional(),
    inicio: z.iso.datetime().optional(),
    fin: z.iso.datetime().optional(),
    servicio: z.string().optional(),
    informe: z.string().nullable().optional(),
    certificado: z.string().nullable().optional(),
    encargado: z.string().nullable().optional(),
    tecnico: z.string().nullable().optional(),
    incidencia: z.string().nullable().optional(),
    status: z.number().optional(),
});

export type ServiciosMcUpdateApiType = z.infer<typeof ServiciosMcUpdateApiSchema>;
