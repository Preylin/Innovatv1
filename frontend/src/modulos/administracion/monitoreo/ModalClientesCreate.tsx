import { useForm } from "@tanstack/react-form";
import { App, Button, Col, Flex, Form, Input, Modal, Row, Typography } from "antd";
import z from "zod";
import { NumericInput } from "../../../components/molecules/input/InputNumero";
import { useCreateCliente } from "../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { ApiError } from "../../../api/normalizeError";
const { Title } = Typography;

const ClienteCreateUISchema = z.object({
  ruc: z.string().min(11, "Requiere minimo 11 caracteres"),
  name: z.string().min(3, "Requiere minimo 3 caracteres"),
});

export type ClienteCreateType = z.infer<typeof ClienteCreateUISchema>;
type ClienteField = keyof ClienteCreateType;
const uiFields = Object.keys(ClienteCreateUISchema.shape) as ClienteField[];

const isClienteField = (field: string): field is ClienteField => {
  return uiFields.includes(field as ClienteField);
};

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


function CrearClienteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
    const { mutateAsync} = useCreateCliente();
    const { message } = App.useApp();
  const form = useForm({
    defaultValues: {
      ruc: "",
      name: "",
    },
    validators: {
      onSubmit: ClienteCreateUISchema,
    },
    onSubmit: async ({value, formApi}) => {
      try {
        const payload: ClienteCreateType = {
          ...value
        };
        await mutateAsync(payload);
        message.success("Cliente creado correctamente");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
            if (err.kind === "validation" && err.data) {
              err.data.forEach((e) => {
                const rawField = e.loc.at(-1);
                if (typeof rawField !== "string") return;
  
                if (isClienteField(rawField)) {
                    formApi.setFieldMeta(rawField, (meta) => ({
                    ...meta,
                    errorMap: {
                        ...meta.errorMap,
                        onSubmit: e.msg,
                    },
                    }));
                }
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
    title={<Title level={4}>Crear cliente</Title>}
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
        <Col xs={24} lg={10}>
          <form.Field name="ruc">
            {(field) => {
              const fieldError = getFieldError(field);
              return (
                <Form.Item
                label="RUC"
                validateStatus={fieldError ? "error" : undefined}
                help={fieldError}
              >
                <NumericInput
                  placeholder="Ingrese RUC"
                  value={field.state.value}
                  onChange={(e) => {
                        field.handleChange(String(e));
                        // limpia error de backend al escribir
                        field.setMeta((meta) => ({
                          ...meta,
                          errorMap: { ...meta.errorMap, onSubmit: undefined },
                        }));
                      }}
                  onBlur={() => field.handleBlur()}
                />
              </Form.Item>
              )
            }}
          </form.Field>
        </Col>
        <Col xs={24} lg={14}>
          <form.Field name="name">
            {(field) => (
              <Form.Item
                validateStatus={
                  field.state.meta.errors.length ? "error" : undefined
                }
                help={field.state.meta.errors[0]?.message}
              >
                <Input
                  placeholder="Razón social"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => field.handleBlur()}
                />
              </Form.Item>
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
