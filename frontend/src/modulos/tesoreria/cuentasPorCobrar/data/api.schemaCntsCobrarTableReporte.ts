import z from "zod";


export const ReporteCntsPorCobrarSchemaApi = z.object({
    id: z.number(),
    periodo: z.string(),
    fecha_emision: z.date(),
    fecha_vencimiento: z.date().nullable(),
    nro_documento: z.string(),
    razon_social: z.string(),
    total: z.number(),
    moneda: z.string(),
    tipo_cambio: z.number(),
    fecha_pago: z.date(),
    monto_pagado: z.number(),
    status_cobro: z.string(),
    link_pdf: z.string(),
    
});

export type ReporteCntsPorCobrarSchemaApiType = z.infer<typeof ReporteCntsPorCobrarSchemaApi>;
