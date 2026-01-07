import z from "zod";

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const UsuarioOutSchema = z.object({
    id: z.number(),
    name: z.string(),
    last_name: z.string(),
    email: z.email(),
    cargo: z.string(),
    estado: z.enum(["activo", "bloqueado"]),
    image_base64: z
    .string()
    .regex(base64Regex)
    .nullable(),
    permisos: z.array(z.object({
        name_module: z.string(),
        id: z.number(),
        usuario_id: z.number(),
        created_at: z.iso.datetime(),
    })).nullable(),
    created_at: z.iso.datetime(),

})

export type UsuarioOutType = z.infer<typeof UsuarioOutSchema>;

export const UsuarioCreateSchema = z.object({
    name: z.string(),
    last_name: z.string(),
    email: z.email(),
    cargo: z.string(),
    estado: z.string(),
    image_byte: z.base64(),
    password: z.string().min(8),
    permisos: z.array(z.object({
        name_module: z.string(),
    })),
});

export type UsuarioCreateType = z.infer<typeof UsuarioCreateSchema>;

export const UsuarioUpdateSchema = z.object({
    name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.email().optional(),
    cargo: z.string().nullable().optional(),
    estado: z.enum(["activo", "bloqueado"]).optional(),
    password: z.string().min(8).optional(),
    image_byte: z.base64().nullable().optional(),
    permisos: z.array(
      z.object({
        name_module: z.string(),
      })
    ).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Debe enviarse al menos un campo a actualizar" }
  );
  
export type UsuarioUpdateType = z.infer<typeof UsuarioUpdateSchema>;

const PermisoCreateSchema = z.object({
    name_module: z.string(),
});

export type PermisoCreateType = z.infer<typeof PermisoCreateSchema>;

const PermisoOutSchema = z.object({
    name_module: z.string(),
    id: z.number(),
    usuario_id: z.number(),
    created_at: z.iso.datetime(),
});

export type PermisoOutType = z.infer<typeof PermisoOutSchema>;