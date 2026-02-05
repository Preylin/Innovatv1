import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  Flex,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import z from "zod";
import { useCreateCliente } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { ApiError } from "../../../../api/normalizeError";
import { useClientesListaList } from "../../../../api/queries/modulos/administracion/lista/clientes/clientesLista.api";
import { useMemo } from "react";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import { setFormErrors } from "../../../../helpers/formHelpers";
import type { ClienteCreateType } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";

const { Title } = Typography;

const ClienteCreateUISchema = z.object({
  ruc: z.string().min(11, "Requiere minimo 11 caracteres"),
  name: z.string().min(3, "Requiere minimo 3 caracteres"),
});

type UsuarioField = keyof typeof ClienteCreateUISchema.shape;
const uiFields = Object.keys(
  ClienteCreateUISchema.shape,
) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};



function CrearClienteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateCliente();
  const { message } = App.useApp();

  const { data: dataCliente } = useClientesListaList();

  const opciones = useMemo(() => {
    return (
      dataCliente?.map((c) => ({
        value: c.cliente,
        label: c.cliente,
      })) ?? []
    );
  }, [dataCliente]);

  const form = useForm({
    defaultValues: {
      ruc: "",
      name: "",
    },
    validators: {
      onSubmit: ClienteCreateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ClienteCreateType = {
          ...value,
        };
        await mutateAsync(payload);
        message.success("Cliente creado correctamente");
        formApi.reset();
        onClose();
      } catch (err) {
              if (err instanceof ApiError) {
                setFormErrors(err, formApi, isUsuarioField);
                if (err.kind !== "validation") message.error(err.message);
              } else {
                message.error("Error inesperado");
              }
            }
    },
  });

  return (
    <Modal
      title={<Title level={4}>Agregar cliente</Title>}
      open={open}
      onCancel={onClose}
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
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <form.Field name="name">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Select
                      {...props}
                      showSearch={{
                        optionFilterProp: 'label',
                        filterOption: (input, option) => {
                          return (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase());
                        },
                      }}
                      placeholder="Selecciona el cliente a registrar"
                      options={opciones}
                      value={props.value === "" ? undefined : props.value}
                      onChange={(value) => {
                        field.handleChange(value as string);
                        field.handleChange(value);
                        const clienteSeleccionado = dataCliente?.find(
                          (c) => c.cliente === value
                        );
                        if (clienteSeleccionado) {
                          field.form.setFieldValue(
                            "ruc",
                            clienteSeleccionado.ruc || ""
                          );
                        }
                      }}
                      onBlur={field.handleBlur}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={10}>
            <form.Field name="ruc">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="RUC"
                      disabled
                    />
                  )}
                </FieldWrapper>
              )}
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

export default CrearClienteModal;
