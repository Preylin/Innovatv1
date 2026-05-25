import { Alert, App, Modal } from "antd";
import { useAppForm } from "../../../../components/tanstackform/components/core/form";

import type {
  UsuarioOutType,
  UsuarioUpdateType,
} from "../../../../api/queries/auth/usuarios.api.schema";
import { useUpdateUsuario } from "../../../../api/queries/auth/usuarios";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { ApiError } from "../../../../api/normalizeError";
import { FromUsuarioCreate } from "./Compose";
import { useQueryClient } from "@tanstack/react-query";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";
import z from "zod";
import { createFieldChecker } from "../../../../helpers/isFieldMapErrorsInputsUI";

interface ModalProps {
  id: number;
  open: boolean;
  onClose: () => void;
}

// Agrega esto a tu archivo de esquemas
export const UsuarioUpdateUISchema = z.object({
  name: z.string().min(3, "Requerido"),
    last_name: z.string().min(3, "Requerido"),
    email: z.email("El email no es válido"),
    cargo: z.string().min(3, "Requerido"),
    estado: z.enum(["activo", "bloqueado"]),
    image_byte: z.file({ message: "La imagen es obligatoria" }).mime(["image/png", "image/jpeg", "image/webp"]),
    password: z.string(),
    permisos: z.array(z.string()).min(1, "Requerido"),
});

export const isUsuarioUpdateUISchema = createFieldChecker(UsuarioUpdateUISchema);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (base64String: string, filename = "imagen_actual.png"): File => {
  // Manejar el caso de que ya venga con el prefijo 'data:image/png;base64,'
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

export function useUsuarioFromCache(id: number): UsuarioOutType | undefined {
  const qc = useQueryClient();
  const usuarios = qc.getQueryData<UsuarioOutType[]>(["usuarios"]);
  return usuarios?.find((u) => u.id === id);
}

export function RegistroUpdateUsuario({ id, open, onClose }: ModalProps) {
  const usuario = useUsuarioFromCache(id);
  const { mutateAsync, isPending, isError, error, reset: resetMutation } = useUpdateUsuario(id);
  const { message } = App.useApp();

  if (!usuario) return null;

  // 1. Convertimos la imagen de caché de string a un File real antes de pasarlo al formulario
  let imagenInicial: File | undefined = undefined;
  if (usuario.image_base64) {
    const base64Completo = getBase64WithPrefix(usuario.image_base64);
    imagenInicial = base64ToFile(base64Completo, "usuario_foto.png");
  }

  const form = useAppForm({
    defaultValues: {
      name: usuario.name,
      last_name: usuario.last_name,
      email: usuario.email,
      password: "", // Inicia vacío de forma segura
      cargo: usuario.cargo,
      estado: usuario.estado,
      permisos: usuario.permisos?.map((p) => p.name_module) ?? [],
      image_byte: imagenInicial as unknown as File,
    },
    validators: {
      onSubmit: UsuarioUpdateUISchema, // <-- Validador de actualización
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const base64Image = await fileToBase64(value.image_byte);

        const payload: UsuarioUpdateType = {
          name: value.name.trim(),
          last_name: value.last_name.trim(),
          email: value.email.trim(),
          password: value.password.trim() || undefined,
          cargo: value.cargo.trim(),
          estado: value.estado,
          image_byte: base64Image,
          permisos: value.permisos,
        };

        await mutateAsync(payload);
        message.success("Usuario actualizado con éxito");
        formApi.reset();
        resetMutation(); // <-- Limpia el estado de la mutación al tener éxito
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioUpdateUISchema);
          // Ya no ponemos message.error aquí porque lo pintaremos abajo de forma declarativa
        }
      }
    },
  });

  const handleClose = () => {
    resetMutation(); // <-- CRUCIAL: Resetea el 'isError' a false al cerrar para que el modal abra limpio la próxima vez
    form.reset();
    onClose();
  };

  return (
    <Modal
      onCancel={handleClose}
      open={open}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
            {isError && error?.kind !== "validation" && (
            <Alert
              title={error?.message || "Ocurrió un error en el servidor"}
              type="error"
              showIcon
            />
          )}
          <div className="w-full">
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Actualizar información de usuario
            </h2>
          </div>
          <div>
            <FromUsuarioCreate form={form} />
            <form.AppForm>
              <div className="flex justify-end mt-4">
                <form.SubscribeButton label="Actualizar" isPending={isPending} />
              </div>
            </form.AppForm>
          </div>
        </div>
      </form>
    </Modal>
  );
}