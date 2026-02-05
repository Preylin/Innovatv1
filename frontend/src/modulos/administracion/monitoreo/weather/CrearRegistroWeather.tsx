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
} from "antd";
import dayjs from "dayjs";
import z from "zod";
import { useMemo, useState } from "react";
import { useCreateWeather } from "../../../../api/queries/modulos/administracion/monitoreo/weather/weather.api";
import { useClientesList } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { DependentSelectOther, type DependentOption } from "../SelectMultipleRelacionada";
import type { WeatherCreateApiType } from "../../../../api/queries/modulos/administracion/monitoreo/weather/weather.api.schema";
import { ApiError } from "../../../../api/normalizeError";
import CrearClienteModal from "../clientesYUbicaciones/ModalClientesCreate";
import CrearUbicacionesModal from "../clientesYUbicaciones/ModalUbicacionesCreate";




const WeatherCreateUISchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Acepta 100 caracteres"),
  ubicacion: z
    .string()
    .min(1, "La ubicación es requerida")
    .max(200, "Acepta 200 caracteres"),
  inicio: z.iso.datetime("La fecha de inicio es requerida"),
  fin: z.iso.datetime("La fecha de fin es requerida"),
  fact_rel: z.string().max(200, "Acepta 200 caracteres").or(z.literal("")),
  adicional: z.string().max(255, "Acepta 255 caracteres").or(z.literal("")),
  status: z.string().or(z.literal("0")),
});

function CreateWeatherUI({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [openCliente, setOpenCliente] = useState(false);
  const [openUbicacion, setOpenUbicacion] = useState(false);
  const handleOpenCliente = () => {
    setOpenCliente(true);
  };
  const handleCloseCliente = () => {
    setOpenCliente(false);
  };
  const handleOpenUbicacion = () => {
    setOpenUbicacion(true);
  };
  const handleCloseUbicacion = () => {
    setOpenUbicacion(false);
  };

  const { mutateAsync } = useCreateWeather();
  const { message } = App.useApp();

  const { data } = useClientesList();
  const dataFromBackend: DependentOption[] = useMemo(
    () =>
      data?.map((cat) => ({
        value: String(cat.id),
        label: cat.name,
        children: cat.ubicaciones.map((sub: { id: number; name: string }) => ({
          value: String(sub.id),
          label: sub.name,
        })),
      })) ?? [],
    [data]
  );
  const form = useForm({
    defaultValues: {
      name: "",
      ubicacion: "",
      inicio: "",
      fin: "",
      fact_rel: "",
      adicional: "",
      status: "0",
    },
    validators: {
      onSubmit: WeatherCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: WeatherCreateApiType = {
          ...value,
          status: Number(value.status),
        };
        await mutateAsync(payload);
        message.success("Registro creado correctamente");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.kind === "validation" && err.data) {
            err.data.forEach((e) => {
              const rawField = e.loc.at(-1);
              if (typeof rawField !== "string") return;
            });

            return;
          }

          message.error(err.message);
          return;
        } else {
          message.error("Error inesperado");
        }
      }
    },
  });

  return (
    <Modal
      title="Crear clima"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
    >
      <CrearClienteModal open={openCliente} onClose={handleCloseCliente} />
      <CrearUbicacionesModal
        open={openUbicacion}
        onClose={handleCloseUbicacion}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <form.Field name="name">
              {(parentField) => (
                <form.Field name="ubicacion">
                  {(childField) => (
                    <Form.Item
                      validateStatus={
                        parentField.state.meta.errors.length ||
                        childField.state.meta.errors.length
                          ? "error"
                          : ""
                      }
                      help={
                        parentField.state.meta.errors[0]?.message ||
                        childField.state.meta.errors[0]?.message
                      }
                    >
                      <DependentSelectOther
                        handleOpenParent={handleOpenCliente}
                        handleOpenChild={handleOpenUbicacion}
                        ButtonNameParent="Crear cliente"
                        ButtonNameChild="Crear ubicación"
                        parentPlaceholder="Selecione el cliente"
                        childPlaceholder="Seleccione la ubicación"
                        data={dataFromBackend}
                        parentValue={parentField.state.value}
                        childValue={childField.state.value}
                        onParentChange={(value) => {
                          parentField.handleChange(value);
                          childField.handleChange("");
                        }}
                        onChildChange={(value) => {
                          childField.handleChange(value);
                        }}
                        onParentBlur={parentField.handleBlur}
                        onChildBlur={childField.handleBlur}
                      />
                    </Form.Item>
                  )}
                </form.Field>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={7}>
            <form.Field name="inicio">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
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
                    placeholder="Fecha de inicio"
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={7}>
            <form.Field name="fin">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
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
                    placeholder="Fecha de fin"
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={10}>
            <form.Field name="fact_rel">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Fact. relacionada"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <form.Field name="adicional">
              {(field) => (
                <Form.Item>
                  <Input.TextArea
                    placeholder="Información adicional"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
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

export default CreateWeatherUI;