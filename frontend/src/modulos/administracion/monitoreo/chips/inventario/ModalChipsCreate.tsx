import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import z from "zod";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import type { ChipCreateType } from "../../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import { useCreateChip } from "../../../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import { ApiError } from "../../../../../api/normalizeError";
import { NumericInput } from "../../../../../components/molecules/input/InputNumero";
import FormUploadImage from "../../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../../helpers/FieldWrapperForm";
import { setFormErrors } from "../../../../../helpers/formHelpers";

const { Title } = Typography;

const ChipCreateUISchema = z.object({
  numero: z.string().regex(/^\d+$/, "Solo números").min(9, "Mínimo 9 dígitos"),
  iccid: z.string().min(19, "Requiere minimo 19 caracteres"),
  operador: z.string().min(3, "Requiere minimo 3 caracteres"),
  mb: z.string().min(1, "Requiere minimo 1 caracter"),
  activacion: z.iso.datetime().or(z.literal("")),
  instalacion: z.iso.datetime().or(z.literal("")),
  adicional: z.string().or(z.literal("")),
  status: z.string().or(z.literal("0")),
  image_byte: z
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Debe existir al menos una imagen"),
});

type ChipField = keyof ChipCreateType;
const uiFields = Object.keys(ChipCreateUISchema.shape) as ChipField[];

function isUsuarioField(field: string): field is ChipField {
  return uiFields.includes(field as ChipField);
}

/* ===================== UTILS ===================== */

function ModalChipsCreate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateChip();
  const { message } = App.useApp();

  const form = useForm({
    defaultValues: {
      numero: "",
      iccid: "",
      operador: "",
      mb: "",
      activacion: "",
      instalacion: "",
      adicional: "",
      status: "0",
      image_byte: [] as { image_byte: string }[],
    },
    validators: {
      onSubmit: ChipCreateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ChipCreateType = {
          ...value,
          numero: parseInt(value.numero),
          status: parseInt(value.status),
          activacion: value.activacion || undefined,
          instalacion: value.instalacion || undefined,
          adicional: value.adicional || undefined,
          imagen1: value.image_byte[0]?.image_byte ?? null,
          imagen2: value.image_byte[1]?.image_byte ?? null,
        };
        // console.log(payload);
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
      title={<Title level={4}>Crear chip</Title>}
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
          <Col span={24}>
            <Flex justify="center" align="center">
              <form.Field name="image_byte">
                {(field) => (
                  <Flex justify="center" align="center">
                    <FieldWrapper field={field}>
                      {(props) => (
                        <Flex justify="center" align="center">
                          <FormUploadImage
                            {...props}
                            field={field}
                            maxFiles={2}
                          />
                        </Flex>
                      )}
                    </FieldWrapper>
                  </Flex>
                )}
              </form.Field>
            </Flex>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="numero">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <NumericInput
                      {...props}
                      placeholder="Ingrese número"
                      value={field.state.value ?? ""}
                      minLength={9}
                      maxLength={11}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="iccid">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Ingrese iccid" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="operador">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Operador" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="mb">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Plan MB" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={8}>
              <Col span={12}>
                <form.Field name="activacion">
                  {(field) => (
                    <FieldWrapper field={field}>
                      {(props) => (
                        <DatePicker
                          {...props}
                          placeholder="Fecha de activación"
                          format="DD/MM/YYYY"
                          value={
                            field.state.value ? dayjs(field.state.value) : null
                          }
                          onChange={(d) =>
                            field.handleChange(d ? d.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FieldWrapper>
                  )}
                </form.Field>
              </Col>

              <Col span={12}>
                <form.Field name="instalacion">
                  {(field) => (
                    <FieldWrapper field={field}>
                      {(props) => (
                        <DatePicker
                          {...props}
                          placeholder="Fecha de instalación"
                          format="DD/MM/YYYY"
                          value={
                            field.state.value ? dayjs(field.state.value) : null
                          }
                          onChange={(d) =>
                            field.handleChange(d ? d.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FieldWrapper>
                  )}
                </form.Field>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="adicional">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <TextArea
                      {...props}
                      placeholder="Información adicional"
                      rows={2}
                      maxLength={255}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Flex justify="end">
          <form.Subscribe
            selector={(s) => [s.isValid, s.isDirty, s.isSubmitting]}
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

export default ModalChipsCreate;
