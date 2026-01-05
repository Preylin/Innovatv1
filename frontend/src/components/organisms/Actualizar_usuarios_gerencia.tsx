import { useForm } from "@tanstack/react-form";
import {
  Modal,
  Input,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Form,
  App,
  Tag,
  Typography,
  Flex,
} from "antd";
import { useEffect, useState } from "react";
import type { SelectProps, UploadFile, UploadProps } from "antd";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { UsuarioOutType } from "../../api/queries/auth/usuarios.api.schema";
import { ApiError } from "../../api/normalizeError";
import { useUpdateUsuario } from "../../api/queries/auth/usuarios";
const { Title } = Typography;

export function useUsuarioFromCache(id: number): UsuarioOutType | undefined {
  const qc = useQueryClient();
  const usuarios = qc.getQueryData<UsuarioOutType[]>(["usuarios"]);
  return usuarios?.find((u) => u.id === id);
}
export const UsuarioUpdateUISchema = z.object({
  name: z.string().min(3, "El nombre es requerido minimo 3 caracteres"),
  last_name: z.string().min(3, "El apellido es requerido minimo 3 caracteres"),
  email: z.email("El email no es válido"),
  password: z.string(),
  cargo: z.string().min(3, "El cargo es requerido minimo 3 caracteres"),
  estado: z.enum(["activo", "bloqueado"]),
  image_byte: z
    .string()
    .regex(
      /^data:image\/(jpeg|jpg|png);base64,/,
      "Solo se permiten imágen JPG, JPEG o PNG"
    ),
  permisos: z
    .array(z.object({ name_module: z.string() }))
    .min(1, "Debe existir al menos un permiso"),
});
export type UserCreateType = z.infer<typeof UsuarioUpdateUISchema>;
type UsuarioField = keyof UserCreateType;
const uiFields = Object.keys(UsuarioUpdateUISchema.shape) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};

type UsuarioUpdatePayload = Partial<{
  name: string;
  last_name: string;
  email: string;
  password: string;
  cargo: string;
  estado: "activo" | "bloqueado";
  image_byte: string;
  permisos: { name_module: string }[];
}>;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const stripBase64Header = (dataUrl: string) => dataUrl.split(",")[1] ?? "";

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

function ModalUpdateUsuario({
  id,
  open,
  onClose,
}: {
  id: number;
  open: boolean;
  onClose: () => void;
}) {
  const usuario = useUsuarioFromCache(id);
  const { mutateAsync } = useUpdateUsuario(id);
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  useEffect(() => {
    if (!open || !usuario) return;

    if (usuario.image_base64) {
      const dataUrl = `data:image/png;base64,${usuario.image_base64}`;

      setFileList([
        {
          uid: "-1",
          name: "imagen-actual.png",
          status: "done",
          url: dataUrl,
          thumbUrl: dataUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [open, usuario?.image_base64]);

  if (!usuario) return null;

  const form = useForm({
    defaultValues: {
      name: usuario.name,
      last_name: usuario.last_name,
      email: usuario.email,
      password: "",
      cargo: usuario.cargo,
      estado: usuario.estado,
      permisos:
        usuario.permisos?.map((p) => ({ name_module: p.name_module })) ?? [],
      image_byte: usuario.image_base64
        ? `data:image/png;base64,${usuario.image_base64}`
        : undefined,
    },

    validators: {
      onSubmit: UsuarioUpdateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: UsuarioUpdatePayload = Object.fromEntries(
          Object.entries(value).filter(([, v]) => v !== "" && v !== undefined)
        ) as UsuarioUpdatePayload;

        if (payload.password !== undefined) {
          if (payload.password.length < 8) {
            throw new Error("La contraseña debe tener al menos 8 caracteres");
          }
        }
        if (payload.image_byte) {
          payload.image_byte = stripBase64Header(payload.image_byte);
        }

        if (Array.isArray(payload.permisos)) {
          payload.permisos = payload.permisos.map((p) => ({
            name_module: p.name_module,
          }));
        }

        await mutateAsync(payload);
        message.success("Usuario actualizado");
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
      open={open}
      onCancel={onClose}
      footer={null}
      title={<Title level={4}>Actualizar Usuario</Title>}
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden={true}
      centered
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <form.Field name="name">
              {(f) => (
                <Form.Item
                  validateStatus={
                    f.state.meta.errors.length ? "error" : undefined
                  }
                  help={f.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Nombre"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>

          <Col span={12}>
            <form.Field name="last_name">
              {(f) => (
                <Form.Item
                  validateStatus={
                    f.state.meta.errors.length ? "error" : undefined
                  }
                  help={f.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Apellidos"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <form.Field name="email">
              {(f) => {
                const fieldError = getFieldError(f);
                return (
                  <Form.Item
                    validateStatus={fieldError ? "error" : undefined}
                    help={fieldError}
                  >
                    <Input
                      placeholder="Email"
                      value={f.state.value}
                      onChange={(e) => f.handleChange(e.target.value)}
                    />
                  </Form.Item>
                );
              }}
            </form.Field>
          </Col>

          <Col span={12}>
            <form.Field name="password">
              {(f) => (
                <Form.Item
                  validateStatus={
                    f.state.meta.errors.length ? "error" : undefined
                  }
                  help={f.state.meta.errors[0]?.message}
                >
                  <Input.Password
                    placeholder="Contraseña"
                    value={f.state.value}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <form.Field name="cargo">
              {(f) => (
                <Form.Item
                  label="Cargo"
                  validateStatus={
                    f.state.meta.errors.length ? "error" : undefined
                  }
                  help={f.state.meta.errors[0]?.message}
                >
                  <Input
                    value={f.state.value ?? ""}
                    onChange={(e) => f.handleChange(e.target.value)}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>

          <Col span={12}>
            <form.Field name="estado">
              {(f) => (
                <Form.Item label="Estado">
                  <Select
                    value={f.state.value}
                    options={estadoOptions}
                    onChange={f.handleChange}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
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
                    value={(field.state.value ?? []).map((p) => p.name_module)}
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

          <Col span={12}>
            <form.Field name="image_byte">
              {(f) => (
                <Form.Item
                  label="Imagen"
                  validateStatus={
                    f.state.meta.errors.length ? "error" : undefined
                  }
                  help={f.state.meta.errors[0]?.message}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={async (file: FileType) => {
                      if (!ALLOWED_TYPES.includes(file.type)) {
                        message.error("Solo JPG o PNG");
                        return Upload.LIST_IGNORE;
                      }
                      if (file.size > MAX_IMAGE_SIZE) {
                        message.error("Máx 2MB");
                        return Upload.LIST_IGNORE;
                      }

                      const reader = new FileReader();
                      reader.onload = () => {
                        f.handleChange(reader.result as string);
                        setFileList([
                          {
                            uid: file.uid,
                            name: file.name,
                            status: "done",
                            thumbUrl: reader.result as string,
                          },
                        ]);
                      };
                      reader.readAsDataURL(file as File);
                      return false;
                    }}
                    onRemove={() => {
                      setFileList([]);
                      f.handleChange(
                        usuario.image_base64
                          ? `data:image/png;base64,${usuario.image_base64}`
                          : undefined
                      );
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

export default ModalUpdateUsuario;
