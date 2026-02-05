import {
  App,
  Button,
  Flex,
  Input,
  Modal,
  Select,
} from "antd";
import { useForm } from "@tanstack/react-form";
import { ReloadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";
import type { ClienteOutType, ClienteUpdateType } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import { useUpdateCliente } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { useMemo } from "react";

const ClienteUpdateUISchema = z.object({
  ruc: z.string().min(1, "El RUC es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  ubicaciones: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});

function useClientesFromCache(id: number | null): ClienteOutType | undefined {
  const qc = useQueryClient();
  const pro = qc.getQueryData<ClienteOutType[]>(["clientes"]);
  return pro?.find((u) => u.id === id);
}

function ClienteShowAndUpdate({ id, open, onClose }: { id: number, open: boolean, onClose: () => void }) {
  const cliente = useClientesFromCache(id);
  const { mutateAsync } = useUpdateCliente(id);
  const { message } = App.useApp();

  // Opciones para el Select
  const options = useMemo(() => 
    cliente?.ubicaciones.map((u) => ({
      value: u.id,
      label: u.name,
    })) ?? [], 
  [cliente]);

  const form = useForm({
    // Importante: Esto solo se ejecuta al montar el componente
    defaultValues: {
      ruc: cliente?.ruc ?? "",
      name: cliente?.name ?? "",
      ubicaciones: cliente?.ubicaciones.map((u) => ({
        id: u.id,
        name: u.name,
      })) ?? [],
    },
    validators: {
      onSubmit: ClienteUpdateUISchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: ClienteUpdateType = {
          ruc: value.ruc,
          name: value.name,
          // Limpiamos el objeto para enviar solo lo que el API espera
          ubicaciones: value.ubicaciones?.map((u) => ({ name: u.name })),
        };
        await mutateAsync(payload);
        message.success("Cliente actualizado correctamente");
        onClose();
      } catch (error) {
        message.error("Error al actualizar");
      }
    },
  });

  return (
    <Modal
      title="Editar Cliente"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      width={{ xs: "90%", sm: "80%", lg: "45%" }}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* RUC */}
        <form.Field name="ruc">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold">RUC:</label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="RUC"
              />
            </div>
          )}
        </form.Field>

        {/* NAME */}
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold">Nombre:</label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Nombre"
              />
            </div>
          )}
        </form.Field>

        {/* UBICACIONES */}
        <form.Field name="ubicaciones">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold">Ubicaciones:</label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                value={field.state.value.map((u: { id: number }) => u.id)}
                options={options}
                onChange={(selectedIds: number[]) => {
                  const selectedObjects = cliente?.ubicaciones.filter((u) => 
                    selectedIds.includes(u.id)
                  );
                  field.handleChange(selectedObjects ?? []);
                }}
                onBlur={field.handleBlur}
                placeholder="Seleccione ubicaciones"
              />
            </div>
          )}
        </form.Field>

        <Flex justify="end">
          <form.Subscribe
            selector={(state) => [state.isValid, state.isDirty, state.isSubmitting]}
          >
            {([isValid, isDirty, isSubmitting]) => (
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isValid || !isDirty}
                loading={isSubmitting}
                icon={<ReloadOutlined />}
              >
                Actualizar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Modal>
  );
}

export default ClienteShowAndUpdate;