import z from "zod";


export const CalendarVencimientosApiSchema = z.object({
  fecha_fin: z.string(),
});
export type CalendarVencimientosApiType = z.infer<typeof CalendarVencimientosApiSchema>;