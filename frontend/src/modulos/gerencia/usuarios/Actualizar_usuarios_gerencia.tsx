import { useForm } from "@tanstack/react-form";
import {
  Modal,
  Input,
  Select,
  Button,
  Row,
  Col,
  App,
  Tag,
  Typography,
  Flex,
} from "antd";
import { useEffect } from "react";
import type { SelectProps } from "antd";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { UsuarioOutType } from "../../../api/queries/auth/usuarios.api.schema";
import { ApiError } from "../../../api/normalizeError";
import { useUpdateUsuario } from "../../../api/queries/auth/usuarios";
import FormUploadImage from "../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../helpers/FieldWrapperForm";
import { setFormErrors } from "../../../helpers/formHelpers";
import getBase64WithPrefix from "../../../helpers/ImagesBase64";
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
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Debe existir al menos una imagen"),
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
  useEffect(() => {
    if (!open || !usuario) return;
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
        ? [{ image_byte: getBase64WithPrefix(usuario.image_base64) }]
        : [],
    },

    validators: {
      onSubmit: UsuarioUpdateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        // 1. Limpiar campos vacíos
        const payload: UsuarioUpdatePayload = {
          name: value.name.trim(),
          last_name: value.last_name.trim(),
          email: value.email.trim(),
          cargo: value.cargo.trim(),
          estado: value.estado,
          permisos: value.permisos,
        };

        if (value.password) {
          payload.password = value.password.trim();
        }

        await mutateAsync(payload);
        message.success("Usuario actualizado");
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
              validators={{ onChange: UsuarioUpdateUISchema.shape.email }}
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
              validators={{ onChange: UsuarioUpdateUISchema.shape.password }}
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

export default ModalUpdateUsuario;
