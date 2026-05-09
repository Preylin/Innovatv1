import z from "zod";

export const EfectivoSchemaOutApi = z.object({
    id: z.number(),
    fecha: z.iso.datetime(),
    descripcion: z.string(),
    referencia: z.string().nullable(),
    ingreso: z.number(),
    egreso: z.number(),
    adicionales: z.string().nullable(),
});
export type EfectivoSchemaOutApiType = z.infer<typeof EfectivoSchemaOutApi>;

export const EfectivoSchemaCrearApi = z.object({
    fecha: z.iso.datetime(),
    descripcion: z.string(),
    referencia: z.string().nullable(),
    ingreso: z.number(),
    egreso: z.number(),
    adicionales: z.string().nullable(),
});
export type EfectivoSchemaCrearApiType = z.infer<typeof EfectivoSchemaCrearApi>;

export const EfectivoShemaUpdateApi = z.object({
    fecha: z.iso.datetime().optional(),
    descripcion: z.string().optional(),
    referencia: z.string().nullable().optional(),
    ingreso: z.number().optional(),
    egreso: z.number().optional(),
    adicionales: z.string().nullable().optional(),
});
export type EfectivoShemaUpdateApiType = z.infer<typeof EfectivoShemaUpdateApi>;


export const SaldoEfectivoSchemaOutApi = z.object({
    saldo_caja_chica: z.number(),
    saldo_bcp_soles: z.number(),
    saldo_bcp_dolares: z.number(),
});
export type SaldoEfectivoSchemaOutApiType = z.infer<typeof SaldoEfectivoSchemaOutApi>;




