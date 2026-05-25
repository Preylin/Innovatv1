import { formOptions } from "@tanstack/react-form";
import z from "zod";
import { createFieldChecker } from "../../../../helpers/isFieldMapErrorsInputsUI";

export const UsuarioCreateUISchema = z.object({
  name: z.string().min(3, "Requerido"),
  last_name: z.string().min(3, "Requerido"),
  email: z.email("El email no es válido"),
  cargo: z.string().min(3, "Requerido"),
  estado: z.enum(["activo", "bloqueado"]),
  image_byte: z.file({ message: "La imagen es obligatoria" }).mime(["image/png", "image/jpeg", "image/webp"]),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  permisos: z.array(z.string()).min(1, "Requerido"),
});
export const isUsuarioCreateUISchema = createFieldChecker(
  UsuarioCreateUISchema,
);

export const FormUsuarioCreateUISchema = formOptions({
  defaultValues: {
    name: "",
    last_name: "",
    email: "",
    cargo: "",
    password: "",
    permisos: ["almacen"],
    estado: "bloqueado" as "activo" | "bloqueado",
    image_byte: undefined as unknown as File,
  },
  validators: {
    onSubmit: UsuarioCreateUISchema,
  },
});