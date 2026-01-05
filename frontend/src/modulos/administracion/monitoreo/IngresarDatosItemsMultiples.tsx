import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import z from "zod";

/* =========================
   SCHEMAS (Zod)
========================= */

const ProductoSchema = z.object({
  name: z.string().min(3, "Requiere mínimo 3 caracteres"),
  cantidad: z.string().min(1, "Requiere cantidad"),
  precio: z.string().min(1, "Requiere precio"),
});

const RegistrarProductosProveedorSchema = z.object({
  ruc: z.string().min(11, "Requiere mínimo 11 caracteres"),
  name: z.string().min(3, "Requiere mínimo 3 caracteres"),
  direccion: z.string().min(3, "Requiere mínimo 3 caracteres"),
  fecha: z.iso.datetime("Ingresar fecha"),
  productos: z
    .array(ProductoSchema)
    .min(1, "Debe ingresar al menos un producto"),
});

export type RegistrarProductosProveedorType = z.infer<
  typeof RegistrarProductosProveedorSchema
>;
const renderErrors = (errors: any[]) =>
  errors
    .map((err) =>
      typeof err === "string" ? err : err?.message || JSON.stringify(err)
    )
    .join(", ");

/* =========================
   COMPONENTE PRINCIPAL
========================= */

function ComponenteRegistrarProductos() {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      ruc: "",
      name: "",
      direccion: "",
      fecha: "",
      productos: [] as RegistrarProductosProveedorType["productos"],
    },
    validators: {
      onSubmit: RegistrarProductosProveedorSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("DATA FINAL:", value);
      message.success("Registro enviado correctamente");
    },
  });

  return (
    <Card title="Registrar productos">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* =========================
            DATOS PROVEEDOR
        ========================= */}
        <Row gutter={16}>
          <Col xs={24} lg={10}>
            <form.Field name="ruc">
              {(field) => (
                <Form.Item
                  label="RUC"
                  validateStatus={field.state.meta.errors.length ? "error" : ""}
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={14}>
            <form.Field name="name">
              {(field) => (
                <Form.Item
                  label="Nombre"
                  validateStatus={field.state.meta.errors.length ? "error" : ""}
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={10}>
            <form.Field name="direccion">
              {(field) => (
                <Form.Item
                  label="Dirección"
                  validateStatus={field.state.meta.errors.length ? "error" : ""}
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={10}>
            <form.Field name="fecha">
              {(field) => (
                <Form.Item
                  label="Fecha"
                  validateStatus={field.state.meta.errors.length ? "error" : ""}
                  help={field.state.meta.errors[0]?.message}
                >
                  <DatePicker
                    value={field.state.value ? dayjs(field.state.value) : null}
                    onChange={(d) =>
                      field.handleChange(d ? d.toISOString() : "")
                    }
                    onBlur={field.handleBlur}
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Fecha"
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={4}>
            <Button type="primary" onClick={() => setOpen(true)}>
              Agregar producto
            </Button>
          </Col>
        </Row>

        {/* LISTADO DE PRODUCTOS USANDO form.Field */}
        <form.Field name="productos" mode="array">
          {(field) => (
            <Card size="small" style={{ marginTop: 16 }}>
              <Row>
                <Col span={8}>
                  <b>Nombre</b>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <b>Cantidad</b>
                </Col>
                <Col span={8} style={{ textAlign: "center" }}>
                  <b>Precio</b>
                </Col>
              </Row>
              <Divider style={{ margin: "8px 0" }} />

              {field.state.value.length === 0 && (
                <div style={{ textAlign: "center", padding: 10 }}>
                  No hay productos registrados
                </div>
              )}

              {field.state.value.map((producto, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 4 }}>
                  <Col span={8}>{producto.name}</Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    {producto.cantidad}
                  </Col>
                  <Col span={6} style={{ textAlign: "center" }}>
                    {producto.precio}
                  </Col>
                  <Col span={2}>
                    <Button
                      danger
                      size="small"
                      onClick={() => field.removeValue(index)}
                    >
                      X
                    </Button>
                  </Col>
                </Row>
              ))}

              {field.state.meta.errors &&
                field.state.meta.errors.length > 0 && (
                  <div style={{ color: "red", marginTop: 8 }}>
                    {renderErrors(field.state.meta.errors)}
                  </div>
                )}
            </Card>
          )}
        </form.Field>

        {/* =========================
            SUBMIT
        ========================= */}
        <Flex justify="end" style={{ marginTop: 16 }}>
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

      {/* MODAL */}
      <form.Field name="productos" mode="array">
        {(field) => (
          <ModalIngresarProducto
            open={open}
            onClose={() => setOpen(false)}
            onAdd={(nuevoProducto) => field.pushValue(nuevoProducto)}
          />
        )}
      </form.Field>
    </Card>
  );
}

/* =========================
   MODAL (Corregido)
========================= */

function ModalIngresarProducto({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (producto: RegistrarProductosProveedorType["productos"][0]) => void;
}) {
  const [producto, setProducto] = useState({
    name: "",
    cantidad: "",
    precio: "",
  });

  const agregarProducto = () => {
    try {
      ProductoSchema.parse(producto);
      onAdd(producto);
      setProducto({ name: "", cantidad: "", precio: "" });
      onClose();
    } catch (err) {
      alert("Por favor rellene los campos del producto correctamente");
    }
  };

  return (
    <Modal
      title="Ingresar producto"
      open={open}
      onCancel={onClose}
      onOk={agregarProducto}
      okText="Agregar"
    >
      <Form layout="vertical">
        <Form.Item label="Nombre del Producto">
          <Input
            value={producto.name}
            onChange={(e) => setProducto({ ...producto, name: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Cantidad">
          <Input
            type="number"
            value={producto.cantidad}
            onChange={(e) =>
              setProducto({ ...producto, cantidad: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Precio">
          <Input
            type="number"
            value={producto.precio}
            onChange={(e) =>
              setProducto({ ...producto, precio: e.target.value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ComponenteRegistrarProductos;
