import z from "zod";

export const UsuarioOutSchema = z.object({
    id: z.number(),
    name: z.string(),
    last_name: z.string(),
    email: z.email(),
    cargo: z.string(),
    estado: z.enum(["activo", "bloqueado"]),
    image_base64: z.string(),
    permisos: z.array(z.object({
        name_module: z.string(),
        id: z.number(),
        usuario_id: z.number(),
        created_at: z.iso.datetime(),
    })),
    created_at: z.iso.datetime(),

})

export type UsuarioOutType = z.infer<typeof UsuarioOutSchema>;

export const UsuarioCreateSchema = z.object({
    name: z.string(),
    last_name: z.string(),
    email: z.email(),
    cargo: z.string(),
    estado: z.string(),
    image_byte: z.string(),
    password: z.string(),
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
    password: z.string().optional(),
    image_byte: z.string().optional(),
    permisos: z.array(
      z.object({
        name_module: z.string(),
      })
    ).optional(),
  })
  
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