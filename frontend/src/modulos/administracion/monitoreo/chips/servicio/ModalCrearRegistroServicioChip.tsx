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
import z from "zod";
import dayjs from "dayjs";
import InputSearch from "../../../../../components/molecules/input/InputSearch";
import { useChipsList } from "../../../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import { useMemo, useState } from "react";
import {
  DependentSelectOther,
  type DependentOption,
} from "../../SelectMultipleRelacionada";
import CrearClienteModal from "../../clientesYUbicaciones/ModalClientesCreate";
import CrearUbicacionesModal from "../../clientesYUbicaciones/ModalUbicacionesCreate";
import { useClientesList } from "../../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import ModalChipsCreate from "../inventario/ModalChipsCreate";
import { useCreateChipServicio } from "../../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api";
import type { ChipServicioCreateApiType } from "../../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api.schema";
import { ApiError } from "../../../../../api/normalizeError";

const CrearChipServicioOutUISchema = z.object({
  name: z.string().min(3, "El nombre es requerido"),
  ubicacion: z.string().min(3, "La ubicación es requerida"),
  numero: z.string().min(3, "El número es requerido"),
  operador: z.string().min(3, "El operador es requerido"),
  plan: z.string().min(3, "El plan es requerido"),
  inicio: z.iso.datetime('La fecha de inicio es requerida'),
  fin: z.iso.datetime('La fecha de fin es requerida'),
  fact_rel: z.string().max(50, "Acepta 50 caracteres"),
  adicional: z.string().max(255, "Acepta 255 caracteres"),
  status: z.number().or(z.literal(0)),
});

function ModalCrearChipServicio({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [openCliente, setOpenCliente] = useState(false);
  const [openUbicacion, setOpenUbicacion] = useState(false);
  const [openChip, setOpenChip] = useState(false);
  const handleOpenCliente = () => setOpenCliente(true);
  const handleCloseCliente = () => setOpenCliente(false);
  const handleOpenUbicacion = () => setOpenUbicacion(true);
  const handleCloseUbicacion = () => setOpenUbicacion(false);
  const handleOpenChip = () => setOpenChip(true);
  const handleCloseChip = () => setOpenChip(false);
  const { message } = App.useApp();

  // 1. Petición de Clientes (Renombrada)
  const { data: clientesData } = useClientesList();

  // 2. Enviar datos al api
  const { mutateAsync } = useCreateChipServicio();

  // Transformación de Clientes
  const dataFromBackend: DependentOption[] = useMemo(() => {
    return (
      clientesData?.map((cat) => ({
        value: String(cat.id),
        label: cat.name,
        children: cat.ubicaciones.map((sub: { id: number; name: string }) => ({
          value: String(sub.id),
          label: sub.name,
        })),
      })) ?? []
    );
  }, [clientesData]); // Dependencia actualizada

  const { data: chipsData } = useChipsList();
  const numeros = useMemo(() => {
    return (
      chipsData
        ?.filter((n) => n.status === 0 || n.status === 1)
        ?.map((n) => ({
          value: n.numero,
          label: n.numero.toString(),
        })) ?? []
    );
  }, [chipsData]);

  const form = useForm({
    defaultValues: {
      name: "",
      ubicacion: "",
      numero: "",
      operador: "",
      plan: "",
      inicio: "",
      fin: "",
      fact_rel: "",
      status: 0,
      adicional: "",
    },
    validators: {
      onSubmit: CrearChipServicioOutUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ChipServicioCreateApiType = {
          ...value,
          fact_rel: value.fact_rel || "",
          adicional: value.adicional || "",
        };
        console.log(payload);
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
      title="Crear servicio"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      maskClosable={false}
      width={{ xs: "90%", sm: "80%", lg: "45%" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CrearClienteModal open={openCliente} onClose={handleCloseCliente} />
        <CrearUbicacionesModal
          open={openUbicacion}
          onClose={handleCloseUbicacion}
        />
        <ModalChipsCreate open={openChip} onClose={handleCloseChip} />
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
          <Col xs={24} lg={8}>
            <form.Field name="numero">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <InputSearch
                    handleOpen={handleOpenChip}
                    ButtonName="Crea chip"
                    options={numeros}
                    placeholder="Seleccionar número"
                    value={field.state.value}
                    onChange={(val) => {
                      const stringVal = val ? String(val) : "";

                      field.handleChange(stringVal);

                      const chipSeleccionado = chipsData?.find(
                        (c) => c.numero.toString() === stringVal
                      );
                      if (chipSeleccionado) {
                        field.form.setFieldValue(
                          "operador",
                          chipSeleccionado.operador || ""
                        );
                        field.form.setFieldValue(
                          "plan",
                          chipSeleccionado.mb?.toString() || ""
                        );
                      }
                    }}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={12} lg={8}>
            <form.Field name="operador">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Operador"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </Form.Item>
              )}
            </form.Field>
          </Col>
          <Col xs={12} lg={8}>
            <form.Field name="plan">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input
                    placeholder="Plan MB"
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
          <Col xs={12} lg={8}>
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
          <Col xs={12} lg={8}>
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
          <Col xs={24} lg={8}>
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
        <Row gutter={16}>
          <Col span={24}>
            <form.Field name="adicional">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Input.TextArea
                    placeholder="Información relacionada"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
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

export default ModalCrearChipServicio;
