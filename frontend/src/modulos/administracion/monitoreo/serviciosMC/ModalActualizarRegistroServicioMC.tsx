import { useForm } from "@tanstack/react-form";
import { App, Button, Col, DatePicker, Flex, Form, Input, Modal, Radio, Row } from "antd";
import { useMemo, useState } from "react";
import z from "zod";
import {
  DependentSelectOther,
  type DependentOption,
} from "../SelectMultipleRelacionada";
import CrearClienteModal from "../clientesYUbicaciones/ModalClientesCreate";
import CrearUbicacionesModal from "../clientesYUbicaciones/ModalUbicacionesCreate";
import { useClientesList } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import dayjs from "dayjs";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import type { ServiciosMcCreateApiType, ServiciosMCOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api.schema";
import { useUpdateServiciosMC } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { ApiError } from "../../../../api/normalizeError";
import { useQueryClient } from "@tanstack/react-query";

// para crear un fecha nueva a un año de la fecha base
const handleAddYear = (isoDate: string): string => {
  const date = new Date(isoDate);

  // Sumamos un año
  date.setFullYear(date.getFullYear() + 1);

  return date.toISOString();
};

const ServiciosMCCreateUISchema = z.object({
  empresa: z.string().min(1, "Campo requerido"),
  ubicacion: z.string().min(1, "Campo requerido"),
  inicio: z.iso.datetime("Campo requerido"),
  servicio: z.array(z.string()).min(1, "Campo requerido"),
  informe: z.string(),
  certificado: z.string(),
  encargado: z.string(),
  tecnico: z.string(),
  incidencia: z.string(),
  status: z.int(),
});

function useServiciosMCFromCache(id: number | null): ServiciosMCOutApiType | undefined {
  const qc = useQueryClient();
  const pro = qc.getQueryData<ServiciosMCOutApiType[]>(["serviciosMC"]);
  return pro?.find((u) => u.id === id);
}

function ModalUpdateServiciosMc(
 { id, open,
  onClose,} : {id: number; open: boolean; onClose: () => void; }
) {
  const { message } = App.useApp();
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

  const serviciosMc = useServiciosMCFromCache(id);
  const { mutateAsync } = useUpdateServiciosMC(id);

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
    [data],
  );

  const optionServis = [
    {
      value: "MANTENIMIENTO",
      label: "Mantenimiento",
    },
    {
      value: "CALIBRACION",
      label: "Calibración",
    },
    {
      value: "INSTALACION",
      label: "Instalación",
    },
    {
      value: "REPARACION",
      label: "Reparación",
    },
  ];

  const form = useForm({
    defaultValues: {
      empresa: serviciosMc?.empresa ?? "",
      ubicacion: serviciosMc?.ubicacion ?? "",
        inicio: serviciosMc?.inicio ?? "",
        servicio: serviciosMc?.servicio.split(" | ") ?? [],
        informe: serviciosMc?.informe ?? "",
        certificado: serviciosMc?.certificado ?? "",
        encargado: serviciosMc?.encargado ?? "",
        tecnico: serviciosMc?.tecnico ?? "",
        incidencia: serviciosMc?.incidencia ?? "",
        status: serviciosMc?.status ?? -1,
    },
    validators: {
      onSubmit: ServiciosMCCreateUISchema,
    },
    onSubmit: async ({ value, formApi}) => {
      try {
        const payload: ServiciosMcCreateApiType = {
          empresa: value.empresa,
          ubicacion: value.ubicacion,
          inicio: value.inicio,
          fin: handleAddYear(value.inicio),
          servicio: value.servicio.join(" | ").toUpperCase(),
          informe: value.informe,
          certificado: value.certificado,
          encargado: value.encargado,
          tecnico: value.tecnico,
          incidencia: value.incidencia,
          status: value.status,
        };
        await mutateAsync(payload);
        message.success("Registro actualizado correctamente");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          setFormErrors(err, formApi);
          if (err.kind !== "validation") message.error(err.message);
        } else {
          message.error("Error inesperado");
        }
      }
    },
  });

  return (
    <Modal
    title="Actualizar Servicio de Mantenimiento y Calibración"
    onOk={onClose}
    onCancel={onClose}
    footer={null}
    width={{ xs: "90%", sm: "80%", lg: "70%" }}
    maskClosable={false}
    open={open}
    destroyOnHidden

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
            <form.Field name="empresa">
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
          <Col xs={24} lg={12}>
            <form.Field name="inicio">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <DatePicker
                      {...props}
                      placeholder="Fecha del servicio"
                      format="DD/MM/YYYY"
                      allowClear
                      style={{ width: "100%" }}
                      value={
                        field.state.value ? dayjs(field.state.value) : null
                      }
                      onChange={(d) =>
                        field.handleChange(d ? d.toISOString() : "")
                      }
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="servicio">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      mode="multiple"
                      placeholder="Servicio"
                      allowClear
                      style={{ width: "100%" }}
                      options={optionServis}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="informe">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="N° de informe" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="certificado">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="N° de certificado"
                      allowClear
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="encargado">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Nombre de encargado"
                      allowClear
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="tecnico">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Nombre del técnico"
                      allowClear
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <form.Field name="incidencia">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input.TextArea
                      {...props}
                      placeholder="Descripción de incidencias"
                      allowClear
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col span={12}>
            <form.Field name="status">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <fieldset
                    className="border-2 border-slate-600 p-3 rounded-xs -mt-2.5"
                  >
                    <legend
                    className="px-3"
                    >
                      Estado:
                    </legend>
                    <Radio.Group
                      {...props}
                      style={{ width: "100%" }}
                      options={[
                        { value: 0, label: "Pendiente" },
                        { value: 1, label: "Renovado" },
                        { value: 2, label: "No renovado" },
                      ]}
                    />
                  </fieldset>
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

export default ModalUpdateServiciosMc;
