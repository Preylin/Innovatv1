import { useForm } from "@tanstack/react-form";
import {
  Form,
  Input,
  Modal,
  Select,
  Upload,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Flex,
} from "antd";
import type { UploadFile, UploadProps, SelectProps } from "antd";
import { useState } from "react";
import { z } from "zod";
import type { UsuarioCreateType } from "../../api/queries/auth/usuarios.api.schema";
import { ApiError } from "../../api/normalizeError";
import { App } from "antd";
import { useCreateUsuario } from "../../api/queries/auth/usuarios";

const { Title } = Typography;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/* ===================== SCHEMA ===================== */

export const UsuarioCreateUISchema = z.object({
  name: z.string().min(3, "El nombre es requerido minimo 3 caracteres"),
  last_name: z.string().min(3, "El apellido es requerido minimo 3 caracteres"),
  email: z.email("El email no es válido"),
  cargo: z.string().min(3, "El cargo es requerido minimo 3 caracteres"),
  estado: z.enum(["activo", "bloqueado"]),
  image_byte: z
    .string()
    .regex(
      /^data:image\/(jpeg|jpg|png);base64,/,
      "Solo se permiten imágen JPG, JPEG o PNG"
    ),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  permisos: z
    .array(z.object({ name_module: z.string() }))
    .min(1, "Debe existir al menos un permiso"),
});

export type UserCreateType = z.infer<typeof UsuarioCreateUISchema>;
type UsuarioField = keyof UserCreateType;
const uiFields = Object.keys(UsuarioCreateUISchema.shape) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};
/* ===================== UTILS ===================== */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type FileType = Parameters<NonNullable<UploadProps["beforeUpload"]>>[0];

/* ===================== OPTIONS ===================== */

const permisoOptions: SelectProps["options"] = [
  { value: "gerencia", label: "Gerencia", color: "gold" },
  { value: "administracion", label: "Administración", color: "blue" },
  { value: "contabilidad", label: "Contabilidad", color: "green" },
  { value: "tesoreria", label: "Tesorería", color: "cyan" },
  { value: "rrhh", label: "RRHH", color: "purple" },
  { value: "ventas", label: "Ventas", color: "volcano" },
  { value: "almacen", label: "Almacén", color: "lime" },
  { value: "produccion", label: "Producción", color: "magenta" },
];

const tagRender: SelectProps["tagRender"] = (props) => {
  const { label, value, closable, onClose } = props;

  const option = permisoOptions.find((o) => o.value === value);

  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      color={option?.color}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};

const estadoOptions: SelectProps["options"] = [
  { value: "activo", label: <span className="text-green-500">Activo</span> },
  {
    value: "bloqueado",
    label: <span className="text-red-500">Bloqueado</span>,
  },
];

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

/* ===================== COMPONENT ===================== */
const stripBase64Header = (dataUrl: string) => dataUrl.split(",")[1] ?? "";

function ModalAddNewUser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateUsuario();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message } = App.useApp();

  const form = useForm({
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      cargo: "",
      password: "",
      permisos: [{ name_module: "almacen" }],
      estado: "bloqueado",
      image_byte: "",
    },

    validators: {
      onSubmit: UsuarioCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: UsuarioCreateType = {
          ...value,
          image_byte: stripBase64Header(value.image_byte),
          permisos: value.permisos.map((p) => ({
            name_module: p.name_module,
          })),
        };

        await mutateAsync(payload);

        message.success("Usuario creado correctamente");
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
      title={<Title level={4}>Nuevo Usuario</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden={true}
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
      centered
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        noValidate
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Nombre */}
            <form.Field name="name">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Nombre"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Apellido */}
            <form.Field name="last_name">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Apellido"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Email */}
            <form.Field
              name="email"
              validators={{ onChange: UsuarioCreateUISchema.shape.password }}
            >
              {(field) => {
                const fieldError = getFieldError(field);

                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError}
                  >
                    <Input
                      placeholder="Email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        // limpia error de backend al escribir
                        field.setMeta((meta) => ({
                          ...meta,
                          errorMap: { ...meta.errorMap, onSubmit: undefined },
                        }));
                      }}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Password */}
            <form.Field
              name="password"
              validators={{ onChange: UsuarioCreateUISchema.shape.password }}
            >
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input.Password
                    placeholder="Contraseña"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Cargo */}
            <form.Field name="cargo">
              {(field) => (
                <Form.Item
                  label="Cargo"
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Estado */}
            <form.Field name="estado">
              {(field) => (
                <Form.Item label="Estado">
                  <Select
                    options={estadoOptions}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Permisos */}
            <form.Field name="permisos">
              {(field) => (
                <Form.Item
                  label="Permisos"
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Select
                    mode="multiple"
                    options={permisoOptions}
                    style={{ width: "100%" }}
                    tagRender={tagRender}
                    value={field.state.value.map((p) => p.name_module)}
                    onChange={(values) =>
                      field.handleChange(
                        values.map((v) => ({ name_module: v }))
                      )
                    }
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Imagen */}
            <form.Field name="image_byte">
              {(field) => (
                <Form.Item
                  label="Imagen"
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Upload
                    listType="picture-card"
                    accept="image/jpeg,image/png"
                    fileList={fileList}
                    maxCount={1}
                    beforeUpload={async (file: FileType) => {
                      if (!ALLOWED_TYPES.includes(file.type)) {
                        message.error("Solo se permiten imágen JPG o PNG");
                        return Upload.LIST_IGNORE;
                      }
                      if (file.size > MAX_IMAGE_SIZE) {
                        message.error("La imagen no debe superar 2MB");
                        return Upload.LIST_IGNORE;
                      }

                      const base64 = await fileToBase64(file as File);
                      field.handleChange(base64);

                      setFileList([
                        {
                          uid: file.uid,
                          name: file.name,
                          status: "done",
                          thumbUrl: base64,
                          originFileObj: file,
                        },
                      ]);

                      return false;
                    }}
                    onRemove={() => {
                      setFileList([]);
                      field.handleChange("");
                    }}
                  >
                    {fileList.length === 0 && "+ Subir"}
                  </Upload>
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

export default ModalAddNewUser;
