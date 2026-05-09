import z from "zod";

//API
export const PersonalActivosObtenerAPI = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  cargo: z.string(),
  fecha_ingreso: z.string(),
  rem_basico: z.number(),
  asig_familiar: z.number().nullable(),
  grati: z.number().nullable(),
  cts: z.number().nullable(),
  vacacion: z.number().nullable(),
});
export type PersonalActivosObtenerAPI = z.infer<
  typeof PersonalActivosObtenerAPI
>;

export const PersonalActivosCrearAPI = z.object({
  dni: z.string(),
  nombre: z.string(),
  cargo: z.string(),
  fecha_ingreso: z.string(),
  rem_basico: z.number(),
  asig_familiar: z.number().nullable(),
  grati: z.number().nullable(),
  cts: z.number().nullable(),
  vacacion: z.number().nullable(),
});
export type PersonalActivosCrearAPI = z.infer<typeof PersonalActivosCrearAPI>;

export const PersonalActivosActualizarAPI = z.object({
  dni: z.string().optional(),
  nombre: z.string().optional(),
  cargo: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  rem_basico: z.number().optional(),
  asig_familiar: z.number().optional(),
  grati: z.number().optional(),
  cts: z.number().optional(),
  vacacion: z.number().optional(),
});
export type PersonalActivosActualizarAPI = z.infer<
  typeof PersonalActivosActualizarAPI
>;

//UI
export const PersonalActivosCrearUI = z.object({
  dni: z.string()
    .min(8, "Mínimo 8 caracteres")
    .max(10, "Máximo 10 caracteres")
    .regex(/^\d+$/, "Solo números"),
  nombre: z.string().min(3, "Requerido" ).max(100),
  cargo: z.string().min(3,"Requerido" ).max(50),
  fecha_ingreso: z.iso.datetime("Requerido"),
  rem_basico: z.number().min(0.0001, "Requerido"),
  asig_familiar: z.number().min(0.0001, "Requerido"),
  grati: z.number().min(0.0001, "Requerido"),
  cts: z.number().min(0.0001, "Requerido"),
  vacacion: z.number().min(0.0001, "Requerido"),
});
export type PersonalActivosCrearUI = z.infer<typeof PersonalActivosCrearUI>;
