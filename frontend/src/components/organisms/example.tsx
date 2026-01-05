import { useForm } from "@tanstack/react-form";
import { Button, Card, Divider, Flex, Input, Select, Spin, Alert } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import z from "zod";
import { useClientesList, useUpdateCliente } from "../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import type { ClienteUpdateType } from "../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";


/* =======================
   ZOD SCHEMA (UI)
======================= */
export const ClienteUpdateUISchema = z.object({
  ruc: z.string().min(1),
  name: z.string().min(1),
  ubicaciones: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});

type ClienteUpdateUI = z.infer<typeof ClienteUpdateUISchema>;

type ClienteAPI = {
  id: number;
  ruc: string;
  name: string;
  ubicaciones: {
    id: number;
    name: string;
    cliente_id: number;
    created_at: string;
  }[];
  created_at: string;
};

type ClienteUI = {
  id: string;
  ruc: string;
  name: string;
  ubicaciones: {
    id: string;
    name: string;
  }[];
};

function mapClienteApiToUI(cliente: ClienteAPI): ClienteUI {
  return {
    id: String(cliente.id),
    ruc: cliente.ruc,
    name: cliente.name,
    ubicaciones: cliente.ubicaciones.map((u) => ({
      id: String(u.id),
      name: u.name,
    })),
  };
}

/* =======================
   LISTADO
======================= */
export function ClientesShow() {
  const { data, isLoading, isError } = useClientesList();
  
  if (isLoading) return <Spin />;
  if (isError) return <Alert type="error" message="Error al cargar clientes" />;
  if (!data) return null;

  return (
    <div className="flex flex-wrap gap-2 p-1">
      {data.map((cliente) => (
        <div key={cliente.id} className="w-80">
          <ClienteShowAndUpdate
            key={cliente.id}
            {...mapClienteApiToUI(cliente)}
          />
        </div>
      ))}
    </div>
  );
}

/* =======================
   FORMULARIO
======================= */


function ClienteShowAndUpdate(props: ClienteUpdateUI & { id: string }) {
    const updateCliente = useUpdateCliente(Number(props.id));
  const options = props.ubicaciones.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  const form = useForm({
    defaultValues: {
      ruc: props.ruc,
      name: props.name,
      ubicaciones: props.ubicaciones
    },
    validators: {
      onSubmit: ClienteUpdateUISchema,
    },
    onSubmit: async ({ value }) => {
      const payload: ClienteUpdateType= {
        ruc: value.ruc,
        name: value.name,
        ubicaciones: value.ubicaciones.map((u) => ({name: u.name})),
      };
      console.log(payload);
      await updateCliente.mutateAsync(payload);
    },
  });

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {/* RUC */}
        <form.Field name="ruc">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="RUC"
            />
          )}
        </form.Field>

        {/* NAME */}
        <form.Field name="name">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Nombre"
            />
          )}
        </form.Field>

        {/* UBICACIONES */}
        <form.Field name="ubicaciones">
          {(field) => (
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={field.state.value.map((u) => u.id)}
              options={options}
              onChange={(selectedIds: string[]) =>
                field.handleChange(
                  props.ubicaciones.filter((u) => selectedIds.includes(u.id))
                )
              }
              onBlur={field.handleBlur}
              placeholder="Ubicaciones"
            />
          )}
        </form.Field>

        <Divider style={{ margin: "8px 0" }} />

        <Flex justify="end">
          <form.Subscribe
            selector={(state) => [
              state.isValid,
              state.isDirty,
              state.isSubmitting,
            ]}
          >
            {([isValid, isDirty, isSubmitting]) => (
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isValid || !isDirty}
                loading={isSubmitting}
                icon={<ReloadOutlined />}
              >
                Guardar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Card>
  );
}
