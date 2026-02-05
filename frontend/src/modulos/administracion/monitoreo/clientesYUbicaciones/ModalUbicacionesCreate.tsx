import { useForm } from "@tanstack/react-form";
import { App, Button, Col, Flex, Form, Input, Modal, Row } from "antd";
import z from "zod";
import { useClientesList, useCreateUbicaciones } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import type { UbicacionCreateType } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import { ApiError } from "../../../../api/normalizeError";
import InputSearch from "../../../../components/molecules/input/InputSearch";
import { DynamicArrayField } from "../../../../components/molecules/listas/ListaMultiple";

const UbicacionCreateUISchema = z.object({
  ubicaciones: z
    .array(
      z.object({
        name: z.string().min(3, "Requiere minimo 3 caracteres"),
      })
    )
    .min(1, "Debe agregar al menos una ubicación"),
  cliente_id: z.string().min(1, "Requiere seleccionar un cliente"),
});

type FormPath =
  | "cliente_id"
  | "ubicaciones"
  | `ubicaciones[${number}]`
  | `ubicaciones[${number}].name`;

function locToFormPath(loc: (string | number)[]): FormPath | null {
  if (loc[0] === "body") loc = loc.slice(1);

  let path = "";

  for (const part of loc) {
    if (typeof part === "number") {
      path += `[${part}]`;
    } else {
      path += path ? `.${part}` : part;
    }
  }

  return path as FormPath;
}

function getFieldError(field: any): string | undefined {
  // error de backend (onSubmit)
  if (field.state.meta.errorMap?.onSubmit)
    return field.state.meta.errorMap.onSubmit;

  // primer error de Zod (frontend)
  if (field.state.meta.errors?.length) {
    const firstError = field.state.meta.errors[0];
    return typeof firstError.message === "string"
      ? firstError.message
      : undefined;
  }

  return undefined;
}

function CrearUbicacionesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useClientesList();
  const { mutateAsync } = useCreateUbicaciones();
  const { message } = App.useApp();
  const clientes =
    data?.map((cliente) => ({
      value: String(cliente.id),
      label: cliente.name,
    })) ?? [];

  const form = useForm({
    defaultValues: {
      ubicaciones: [{ name: "" }],
      cliente_id: "",
    },
    validators: {
      onSubmit: UbicacionCreateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: UbicacionCreateType = {
          ...value,
          cliente_id: Number(value.cliente_id),
        };
        await mutateAsync(payload);
        message.success("Ubicaciones creadas correctamente");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === "validation" && err.data) {
            err.data.forEach((e) => {
              const path = locToFormPath(e.loc);
              if (!path) return;

              formApi.setFieldMeta(path, (meta) => ({
                ...meta,
                errorMap: {
                  ...meta.errorMap,
                  onSubmit: e.msg,
                },
              }));
            });

            return;
          }

          message.error(err.message);
          return;
        }

        message.error("Error inesperado");
      }
    },
  });

  return (
    <Modal
      title="Asignar ubicaciones"
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden={true}
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="cliente_id">
              {(field) => (
                <Form.Item
                  label="Cliente"
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <InputSearch
                    options={clientes}
                    placeholder="Seleccione un cliente"
                    value={field.state.value}
                    onChange={(value) =>
                      field.handleChange(value ? String(value) : "")
                    }
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="ubicaciones" mode="array">
              {(arrayField) => {
                return (
                  <DynamicArrayField
                    value={arrayField.state.value}
                    onAdd={() => arrayField.pushValue({ name: "" })}
                    onRemove={(index) => arrayField.removeValue(index)}
                    renderItem={(index) => (
                      <div className="flex gap-1">
                        <form.Field name={`ubicaciones[${index}].name`}>
                          {(field) => (
                            <div className="w-full">
                              <Form.Item
                                validateStatus={
                                  field.state.meta.errors.length ||
                                  field.state.meta.errorMap?.onSubmit
                                    ? "error"
                                    : undefined
                                }
                                help={getFieldError(field)}
                                style={{ marginBottom: 6, width: "100%" }}
                              >
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="Agregar ubicación"
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  onBlur={field.handleBlur}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </div>
                          )}
                        </form.Field>
                      </div>
                    )}
                  />
                );
              }}
            </form.Field>
          </Col>
        </Row>
        <Flex justify="end" align="center">
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
              >
                Guardar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Modal>
  );
}

export default CrearUbicacionesModal;
