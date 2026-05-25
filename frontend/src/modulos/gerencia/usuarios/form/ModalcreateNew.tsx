import { Alert, App, Modal } from "antd";
import { useAppForm } from "../../../../components/tanstackform/components/core/form";
import {
  FormUsuarioCreateUISchema,
  isUsuarioCreateUISchema,
} from "./StructureFormData";
import type { UsuarioCreateType } from "../../../../api/queries/auth/usuarios.api.schema";
import { useCreateUsuario } from "../../../../api/queries/auth/usuarios";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { ApiError } from "../../../../api/normalizeError";
import { FromUsuarioCreate } from "./Compose";
import { useState } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

// Convierte un archivo nativo de JS a una cadena Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function NewModalRegistro({ open, onClose }: ModalProps) {
  // Desestructuramos solo 'isPending' ya que manejaremos el error local de forma controlada
  const { mutateAsync, isPending } = useCreateUsuario();
  const { message } = App.useApp();
  
  // Estado local para controlar errores informativos globales del backend
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useAppForm({
    ...FormUsuarioCreateUISchema,
    onSubmit: async ({ value, formApi }) => {
      try {
        setGlobalError(null); // <-- Limpiamos errores previos al intentar enviar de nuevo

        const payload: UsuarioCreateType = {
          name: value.name.trim(),
          last_name: value.last_name.trim(),
          email: value.email.trim(),
          password: value.password.trim(),
          cargo: value.cargo.trim(),
          estado: value.estado,
          image_byte: await fileToBase64(value.image_byte),
          permisos: value.permisos,
        };

        await mutateAsync(payload);
        message.success("Registrado exitosamente");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          // Si el error es de validación (ej: Email duplicado), va al input
          setFormErrors(err, formApi, isUsuarioCreateUISchema);
          
          // SI ES INFORMATIVO / HTTP (ej: "No tienes permisos", "Servidor en mantenimiento")
          if (err.kind !== "validation") {
            setGlobalError(err.message);
          }
        } else {
          setGlobalError("Error inesperado en el sistema. Intente de nuevo.");
        }
      }
    },
  });

  // Limpieza del estado al cerrar el modal externamente
  const handleClose = () => {
    setGlobalError(null);
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
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Registrar usuario nuevo
            </h2>
          </div>

          {/* RENDERIZADO DEL ERROR INFORMATIVO/GLOBAL */}
          {globalError && (
            <Alert
              message={globalError}
              type="error"
              showIcon
              closable
              onClose={() => setGlobalError(null)}
              className="text-xs"
            />
          )}

          <div>
            <FromUsuarioCreate form={form} />
            <form.AppForm>
              <div className="flex justify-end mt-4">
                <form.SubscribeButton label="Registrar" isPending={isPending} />
              </div>
            </form.AppForm>
          </div>
        </div>
      </form>
    </Modal>
  );
}
