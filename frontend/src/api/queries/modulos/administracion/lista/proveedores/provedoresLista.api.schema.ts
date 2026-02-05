import z from "zod";


export const ProveedoresListaOutApiSchema = z.object({
    id: z.number(),
    ruc: z.string(),
    proveedor: z.string(),
    dfiscal: z.string().nullable(),
    contacto1: z.string().nullable(),
    contacto2: z.string().nullable(),
    contacto3: z.string().nullable(),
    contacto4: z.string().nullable(),
    contacto5: z.string().nullable(),
    otro1: z.string().nullable(),
    otro2: z.string().nullable(),
    otro3: z.string().nullable(),
    otro4: z.string().nullable(),
    otro5: z.string().nullable(),
    created_at: z.iso.datetime(),
});

export type ProveedoresListaOutApiType = z.infer<typeof ProveedoresListaOutApiSchema>;

export const ProveedoresListaCreateApiSchema = z.object({
    ruc: z.string(),
    proveedor: z.string(),
    dfiscal: z.string().nullable(),
    contacto1: z.string().nullable(),
    contacto2: z.string().nullable(),
    contacto3: z.string().nullable(),
    contacto4: z.string().nullable(),
    contacto5: z.string().nullable(),
    otro1: z.string().nullable(),
    otro2: z.string().nullable(),
    otro3: z.string().nullable(),
    otro4: z.string().nullable(),
    otro5: z.string().nullable(),
});

export type ProveedoresListaCreateApiType = z.infer<typeof ProveedoresListaCreateApiSchema>;

export const ProveedoresListaUpdateApiSchema = z.object({
    ruc: z.string().optional(),
    proveedor: z.string().optional(),
    dfiscal: z.string().nullable().optional(),
    contacto1: z.string().nullable().optional(),
    contacto2: z.string().nullable().optional(),
    contacto3: z.string().nullable().optional(),
    contacto4: z.string().nullable().optional(),
    contacto5: z.string().nullable().optional(),
    otro1: z.string().nullable().optional(),
    otro2: z.string().nullable().optional(),
    otro3: z.string().nullable().optional(),
    otro4: z.string().nullable().optional(),
    otro5: z.string().nullable().optional(),
});

export type ProveedoresListaUpdateApiType = z.infer<typeof ProveedoresListaUpdateApiSchema>;