import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Modal, Form, Input, Button, Alert, Typography } from "antd";
import { useAuth } from "./AuthProvider";
import { ApiError } from "../api/normalizeError";
import { authErrorToMessage } from "./ErrorHelperUI";

const { Title, Text } = Typography;

const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

const canon = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const buildRoute = (to: string) => `/${to.toLowerCase()}`;

export function LoginModal({
  name,
  to = name,
  onLogin,
  onClose,
}: {
  name: string;
  to?: string;
  onLogin?: (result: any) => void;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setGeneralError(null);
      try {
        const user = await login(value.email, value.password);

        const permisos = user.permisos ?? [];
        const allowed = new Set(permisos.map((p) => canon(p.name_module)));
        const targetCanon = canon(String(to));
        const isAllowed = allowed.has(targetCanon);

        setTimeout(() => {
          onLogin?.({
            userId: user.id.toString(),
            targetId: String(to),
            route: buildRoute(String(to)),
            isAllowed: isAllowed,
            moduleName: name,
          });

          onClose();
        }, 100);
      } catch (err) {
        if (err instanceof ApiError) {
          setGeneralError(authErrorToMessage(err));
          return;
        }
        setGeneralError("Error inesperado al iniciar sesión");
      }
    },
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <Modal
      open
      centered
      footer={null}
      width={350}
      onCancel={onClose}
      destroyOnHidden
      closable={false}
      maskClosable={false}
      keyboard={false}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
        Iniciar sesión
      </Title>

      <Text
        style={{
          display: "block",
          textAlign: "center",
          fontSize: 18,
          marginBottom: 24,
        }}
      >
        <strong>{name}</strong>
      </Text>

      {generalError && (
        <Alert
          type="error"
          title={generalError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form layout="vertical" onFinish={form.handleSubmit}>
        <form.Field
          name="email"
          validators={{ onChange: loginSchema.shape.email }}
        >
          {(field) => (
            <Form.Item
              label="Usuario"
              validateStatus={
                field.state.meta.errors.length ? "error" : undefined
              }
              help={field.state.meta.errors[0]?.message}
            >
              <Input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Form.Item>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: loginSchema.shape.password }}
        >
          {(field) => (
            <Form.Item
              label="Contraseña"
              validateStatus={
                field.state.meta.errors.length ? "error" : undefined
              }
              help={field.state.meta.errors[0]?.message}
            >
              <Input.Password
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Item>
          )}
        </form.Field>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={form.state.isSubmitting}
        >
          Ingresar
        </Button>

        <Button
          type="text"
          danger
          block
          style={{ marginTop: 12 }}
          onClick={onClose}
        >
          Cancelar
        </Button>
      </Form>
    </Modal>
  );
}

export default LoginModal;
