import z from "zod";

const base64Regex =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

// PARA CLIENTES
export const ClienteOutSchema = z.object({
  id: z.number(),
  ruc: z.string(),
  name: z.string(),
  ubicaciones: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      cliente_id: z.number(),
      created_at: z.iso.datetime(),
    })
  ),
  created_at: z.iso.datetime(),
});

export type ClienteOutType = z.infer<typeof ClienteOutSchema>;

export const ClienteCreateSchema = z.object({
  ruc: z.string(),
  name: z.string(),
});

export type ClienteCreateType = z.infer<typeof ClienteCreateSchema>;

export const ClienteUpdateSchema = z.object({
  ruc: z.string().optional(),
  name: z.string().optional(),
  ubicaciones: z.array(
    z.object({
      name: z.string(),
    })
  ),
});

export type ClienteUpdateType = z.infer<typeof ClienteUpdateSchema>;

// PARA UBICACIONES

export const UbicacionOutSchema = z.object({
  id: z.number(),
  name: z.string(),
  cliente_id: z.number(),
  created_at: z.iso.datetime(),
});

export type UbicacionOutType = z.infer<typeof UbicacionOutSchema>;

export const UbicacionOutArraySchema = z.array(UbicacionOutSchema);
export type UbicacionOutArrayType = z.infer<typeof UbicacionOutArraySchema>;

export const UbicacionCreateSchema = z.object({
  cliente_id: z.number(),
  ubicaciones: z.array(
    z.object({
      name: z.string().trim(),
    })
  ),
});

export type UbicacionCreateType = z.infer<typeof UbicacionCreateSchema>;



//PARA CHIPS

export const ChipOutSchema = z.object({
  id: z.number(),
  numero: z.number(),
  iccid: z.string(),
  operador: z.string(),
  mb: z.string(),
  activacion: z.iso.datetime().nullable(),
  instalacion: z.iso.datetime().nullable(),
  adicional: z.string().nullable(),
  status: z.number(),
  imagen: z.array(
    z.object({
      id: z.number(),
      chip_id: z.number(),
      image_base64: z.string().nullable(),
      created_at: z.iso.datetime(),
    })
  ),
  created_at: z.iso.datetime(),
});

export type ChipOutType = z.infer<typeof ChipOutSchema>;

export const ChipCreateSchema = z.object({
  numero: z.number(),
  iccid: z.string(),
  operador: z.string(),
  mb: z.string(),
  activacion: z.iso.datetime().optional(),
  instalacion: z.iso.datetime().optional(),
  adicional: z.string().optional(),
  status: z.number(),
  image_byte: z.array(
    z.object({
      image_byte: z.string().regex(base64Regex),
    })
  ),
});

export type ChipCreateType = z.infer<typeof ChipCreateSchema>;

export const ChipUpdateSchema = z.object({
  numero: z.number().optional(),
  iccid: z.string().optional(),
  operador: z.string().optional(),
  mb: z.string().optional(),
  activacion: z.string().optional(),
  instalacion: z.string().optional(),
  adicional: z.string().optional(),
  status: z.number().optional(),
  image_byte: z.array(
    z.object({
      image_byte: z.string().regex(base64Regex),
    })
  ).optional(),
});

export type ChipUpdateType = z.infer<typeof ChipUpdateSchema>;

