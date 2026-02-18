import { useForm } from "@tanstack/react-form";
import {
  Input,
  Modal,
  Select,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Flex,
} from "antd";
import type { SelectProps } from "antd";
import { z } from "zod";
import type { UsuarioCreateType } from "../../../api/queries/auth/usuarios.api.schema";
import { ApiError } from "../../../api/normalizeError";
import { App } from "antd";
import { useCreateUsuario } from "../../../api/queries/auth/usuarios";
import FormUploadImage from "../../../components/molecules/upload/UploadImage";
import { setFormErrors } from "../../../helpers/formHelpers";
import { FieldWrapper } from "../../../helpers/FieldWrapperForm";

const { Title } = Typography;

/* ===================== SCHEMA ===================== */

export const UsuarioCreateUISchema = z.object({
  name: z.string().min(3, "El nombre es requerido minimo 3 caracteres"),
  last_name: z.string().min(3, "El apellido es requerido minimo 3 caracteres"),
  email: z.email("El email no es válido"),
  cargo: z.string().min(3, "El cargo es requerido minimo 3 caracteres"),
  estado: z.enum(["activo", "bloqueado"]),
  image_byte: z
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Debe existir al menos una imagen"),
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

/* ===================== COMPONENT ===================== */

function ModalAddNewUser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateUsuario();
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
      image_byte: [] as { image_byte: string }[],
    },

    validators: {
      onSubmit: UsuarioCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: UsuarioCreateType = {
          name: value.name.trim(),
          last_name: value.last_name.trim(),
          email: value.email.trim(),
          password: value.password.trim(),
          cargo: value.cargo.trim(),
          estado: value.estado,
          image_byte: value.image_byte.map((i) => ({
              image_byte: i.image_byte.split(",")[1] || "",
            })),
          permisos: value.permisos.map((p) => ({
            name_module: p.name_module,
          })),
        };

        await mutateAsync(payload);
        message.success("Usuario creado correctamente");
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
      title={<Title level={4}>Nuevo Usuario</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
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
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Nombre" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Apellido */}
            <form.Field name="last_name">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Apellidos" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Email */}
            <form.Field
              name="email"
              validators={{ onChange: UsuarioCreateUISchema.shape.email }}
            >
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Email" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Password */}
            <form.Field
              name="password"
              validators={{ onChange: UsuarioCreateUISchema.shape.password }}
            >
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Contraseña" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Cargo */}
            <form.Field name="cargo">
              {(field) => (
                <FieldWrapper field={field} label="Cargo:">
                  {(props) => (
                    <Input {...props} placeholder="Cargo" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            {/* Estado */}
            <form.Field name="estado">
              {(field) => (
                <FieldWrapper field={field} label="Estado:">
                  {(props) => (
                    <Select
                      {...props}
                      options={estadoOptions}
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {/* Permisos */}
            <form.Field name="permisos">
              {(field) => (
                <FieldWrapper field={field} label="Permisos:">
                  {(props) => (
                    <Select
                      {...props}
                      mode="multiple"
                      options={permisoOptions}
                      style={{ width: "100%" }}
                      tagRender={tagRender}
                      value={field.state.value.map((p) => p.name_module)}
                      onChange={(values) =>
                        field.handleChange(
                          values.map((v) => ({ name_module: v })),
                        )
                      }
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            {/* Imagen */}
            <form.Field name="image_byte">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormUploadImage {...props} field={field} maxFiles={1} />
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

export default ModalAddNewUser;
