import z, { string } from "zod";


export const HistorialVentasOutApiSchema = z.object({
    id: z.number(),
    fecha: z.iso.datetime(),
    descripcion: string(),
    categoria: z.string(),
    ruc: z.string(),
    cliente: z.string(),
    tipo: z.string(),
    serie: z.string(),
    numero: z.number(),
    subtotal: z.number(),
    igv: z.number(),
    total: z.number(),
    tc: z.number(),
    created_at: z.iso.datetime(),
});

export type HistorialVentasOutApiType = z.infer<typeof HistorialVentasOutApiSchema>;

