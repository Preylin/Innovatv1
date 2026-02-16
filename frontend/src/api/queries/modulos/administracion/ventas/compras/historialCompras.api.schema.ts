import z, { string } from "zod";


export const HistorialComprasOutApiSchema = z.object({
    id: z.number(),
    fecha: z.iso.datetime(),
    descripcion: string(),
    ruc: z.string(),
    proveedor: z.string(),
    tipo: z.string(),
    serie: z.string(),
    numero: z.number(),
    subtotal: z.number(),
    igv: z.number(),
    nograbada: z.number(),
    otros: z.number(),
    total: z.number(),
    tc: z.number(),
    created_at: z.iso.datetime(),
});

export type HistorialComprasOutApiType = z.infer<typeof HistorialComprasOutApiSchema>;
