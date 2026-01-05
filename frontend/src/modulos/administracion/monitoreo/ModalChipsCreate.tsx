import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import z from "zod";
import type { ChipCreateType } from "../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import dayjs from "dayjs";
import { NumericInput } from "../../../components/molecules/input/InputNumero";
import { useCreateChip } from "../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import { ApiError } from "../../../api/normalizeError";

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
          .regex(
            /^data:image\/(jpeg|jpg|png);base64,/,
            "Solo se permiten imágen JPG, JPEG o PNG"
          ),
      })
    )
    .min(1, "Debe existir al menos una imagen"),
});

type ChipField = keyof ChipCreateType;
const uiFields = Object.keys(ChipCreateUISchema.shape) as ChipField[];

function isUsuarioField(field: string): field is ChipField {
  return uiFields.includes(field as ChipField);
}

/* ===================== UTILS ===================== */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function getFieldError(field: any): string | null {
  const submitError = field.state.meta.errorMap?.onSubmit;
  if (typeof submitError === "string") return submitError;

  const zodError = field.state.meta.errors?.[0];
  if (zodError && typeof zodError.message === "string") {
    return zodError.message;
  }

  return null;
}

function ModalChipsCreate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateChip();
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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
          image_byte: value.image_byte.map((img) => ({
            image_byte: img.image_byte.split(",")[1],
          })),
        };
        // console.log(payload);
        await mutateAsync(payload);
        message.success("Cliente creado correctamente");
        formApi.reset();
        setFileList([]);
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === "validation" && err.data) {
            err.data.forEach((e) => {
              const rawField = e.loc.at(-1);
              if (typeof rawField !== "string") return;

              if (isUsuarioField(rawField)) {
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
          <Col xs={24} lg={12}>
            <form.Field name="numero">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <NumericInput
                      placeholder="Ingrese número"
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
                );
              }}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="iccid">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <Input
                      placeholder="Ingrese iccid"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="operador">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <Input
                      placeholder="Ingrese operador"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="mb">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <Input
                      placeholder="Ingrese plan MB"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Row gutter={8}>
              <Col span={12}>
                <form.Field name="activacion">
                  {(field) => {
                    const fieldError = getFieldError(field);
                    return (
                      <Form.Item
                        validateStatus={fieldError ? "error" : undefined}
                        help={fieldError || null}
                      >
                        <DatePicker
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
                      </Form.Item>
                    );
                  }}
                </form.Field>
              </Col>
              <Col span={12}>
                <form.Field name="instalacion">
                  {(field) => {
                    const fieldError = getFieldError(field);
                    return (
                      <Form.Item
                        validateStatus={fieldError ? "error" : undefined}
                        help={fieldError || null}
                      >
                        <DatePicker
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
                      </Form.Item>
                    );
                  }}
                </form.Field>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="adicional">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <TextArea
                      placeholder="Información adicional"
                      rows={2}
                      maxLength={255}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>
        </Row>

        <Row>
          <Col xs={24} lg={12}>
            <form.Field name="image_byte">
              {(field) => {
                const fieldError = getFieldError(field);
                return (
                  <Form.Item
                    label="Imágenes"
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError || null}
                  >
                    <Upload
                      listType="picture-card"
                      accept="image/jpeg,image/png"
                      fileList={fileList}
                      maxCount={2}
                      beforeUpload={async (file) => {
                        if (!ALLOWED_TYPES.includes(file.type)) {
                          message.error("Solo JPG o PNG");
                          return Upload.LIST_IGNORE;
                        }
                        if (file.size > MAX_IMAGE_SIZE) {
                          message.error("Máx. 2MB");
                          return Upload.LIST_IGNORE;
                        }

                        const base64 = await fileToBase64(file as File);
                        const currentImages = field.state.value || [];

                        field.handleChange([
                          ...currentImages,
                          { image_byte: base64 },
                        ]);
                        setFileList((prev) => [
                          ...prev,
                          { ...file, status: "done", url: base64 },
                        ]);

                        return false;
                      }}
                      onRemove={(file) => {
                        const index = fileList.findIndex(
                          (f) => f.uid === file.uid
                        );
                        const newImages = [...(field.state.value || [])];
                        newImages.splice(index, 1);
                        field.handleChange(newImages);
                        setFileList((prev) =>
                          prev.filter((f) => f.uid !== file.uid)
                        );
                      }}
                    >
                      {fileList.length < 2 && "+ Subir"}
                    </Upload>
                  </Form.Item>
                );
              }}
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
