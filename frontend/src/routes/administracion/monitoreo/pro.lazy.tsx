import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  useCreatePro,
  useDeletePro,
  useProList,
  useUpdatePro,
} from "../../../api/queries/modulos/administracion/monitoreo/pro/pro.api";
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
  Popconfirm,
  Radio,
  Row,
  Skeleton,
} from "antd";
import { SearchBar } from "../../../components/molecules/input/SearchBar";
import { PlusOutlined } from "@ant-design/icons";
import ButtonDelete from "../../../components/molecules/botons/BottonDelete";
import isoToDDMMYYYY from "../../../helpers/Fechas";
import z from "zod";
import { useClientesList } from "../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import {
  DependentSelectOther,
  type DependentOption,
} from "../../../modulos/administracion/monitoreo/SelectMultipleRelacionada";
import { useForm } from "@tanstack/react-form";
import type {
  ProCreateApiType,
  ProOutApiType,
  ProUpdateApiType,
} from "../../../api/queries/modulos/administracion/monitoreo/pro/pro.api.schema";
import { ApiError } from "../../../api/normalizeError";
import CrearClienteModal from "../../../modulos/administracion/monitoreo/ModalClientesCreate";
import CrearUbicacionesModal from "../../../modulos/administracion/monitoreo/ModalUbicacionesCreate";
import dayjs from "dayjs";
import ButtonUpdate from "../../../components/molecules/botons/BottonUpdate";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createLazyFileRoute("/administracion/monitoreo/pro")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Showpro />
    </>
  );
}

export function OptionStatusUI({ status }: { status: number }) {
  switch (status) {
    case 0:
      return <div className="text-yellow-500">Estado: Pendiente</div>;
    case 1:
      return <div className="text-cyan-600">Estado: Renovado</div>;
    case 2:
      return <div className="text-fuchsia-600">Estado: No renovado</div>;
    default:
      return "Sin información";
  }
}

function Showpro() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  // 3. Estados para controlar el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleOpenModal = (id: number) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };
  const { data, isLoading, isError } = useProList();
  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });
  const { mutate } = useDeletePro();
  const { message } = App.useApp();

  const handleSearch = useCallback(
    (params: { field: string; value: string }) => {
      setSearchParams(params);
    },
    []
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchParams.value) return data;

    const term = searchParams.value.toLowerCase();
    return data.filter((item: any) => {
      const valToSearch = item[searchParams.field];
      return String(valToSearch ?? "")
        .toLowerCase()
        .includes(term);
    });
  }, [data, searchParams]);

  if (isLoading) return <Skeleton active />;
  if (isError) return <p>Error</p>;
  if (!data) return <p>No hay datos</p>;

  return (
    <div className="flex flex-col gap-4 p-2 width-full">
      <Row
        gutter={16}
        style={{ width: "100%" }}
        justify="space-evenly"
        align="middle"
      >
        <Col span={20}>
          <SearchBar
            options={[
              { label: "Cliente", value: "name" },
              { label: "Ubicación", value: "ubicacion" },
              { label: "Inicio", value: "inicio" },
              { label: "Fin", value: "fin" },
              { label: "Fact. rel.", value: "fact_rel" },
              { label: "Inf. adicional", value: "adicional" },
              { label: "Status", value: "status" },
            ]}
            onSearch={handleSearch}
            defaultField="name"
          />
        </Col>
        <Col span={4}>
          <Button type="primary" onClick={handleOpen}>
            <PlusOutlined /> Nuevo registro
          </Button>
          <CreateproUI open={open} onClose={handleClose} />
        </Col>
      </Row>

      <div className="flex flex-wrap gap-4 width-full">
        {filteredData.map((pro) => (
          <Card
            key={pro.id}
            style={{
              width: "1 1 300px", // grow | shrink | basis
              maxWidth: 330,
            }}
          >
            <Row>
              <Col span={24}>
                <p className="font-bold">{pro.name}</p>
              </Col>
            </Row>
            <Row>
              <Col span={24}>Dirección: {pro.ubicacion}</Col>
              <Col span={24}>Inicio: {isoToDDMMYYYY(pro.inicio)}</Col>
              <Col span={24}>
                <div className="text-pink-500">
                  Fin: {isoToDDMMYYYY(pro.fin)}
                </div>
              </Col>
              <Col span={24}>Fact. relacionada: {pro.fact_rel}</Col>
              {pro.adicional && (
                <Col span={24}>Información adicional: {pro.adicional}</Col>
              )}
            </Row>
            <Divider
              style={{ margin: 3, width: "100%", borderColor: "transparent" }}
            />
            <Row>
              <Col span={18}>
                {pro.status !== null && (
                  <Col span={24}>
                    <OptionStatusUI status={pro.status} />
                  </Col>
                )}
              </Col>
              <Col span={3}>
                <ButtonUpdate onClick={() => handleOpenModal(pro.id)} />
              </Col>
              <Col span={3}>
                <Popconfirm
                  title="¿Eliminar registro?"
                  description="Esta acción no se puede deshacer"
                  okText="Eliminar"
                  cancelText="Cancelar"
                  onConfirm={() =>
                    mutate(pro.id, {
                      onSuccess: () => message.success("Registro eliminado"),
                      onError: (err) => message.error(err.message),
                    })
                  }
                >
                  <ButtonDelete />
                </Popconfirm>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
      {selectedUserId !== null && (
        <UpdateproUI
          id={selectedUserId}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

const ProCreateUISchema = z.object({
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

function CreateproUI({
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

  const { mutateAsync } = useCreatePro();
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
      onSubmit: ProCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ProCreateApiType = {
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
      width={{ xs: "90%", sm: "80%", lg: "45%" }}
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

const ProUpdateUISchema = z.object({
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
  status: z.number().int().min(0).max(2),
});

export function useproFromCache(id: number | null): ProOutApiType | undefined {
  const qc = useQueryClient();
  const pro = qc.getQueryData<ProOutApiType[]>(["pro"]);
  return pro?.find((u) => u.id === id);
}

function UpdateproUI({
  id,
  open,
  onClose,
}: {
  id: number;
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
  const pro = useproFromCache(id);

  const { mutateAsync } = useUpdatePro(id);
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
      name: pro?.name ?? "",
      ubicacion: pro?.ubicacion ?? "",
      inicio: pro?.inicio ?? "",
      fin: pro?.fin ?? "",
      fact_rel: pro?.fact_rel ?? "",
      adicional: pro?.adicional ?? "",
      status: pro?.status ?? "",
    },
    validators: {
      onSubmit: ProUpdateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ProUpdateApiType = {
          ...value,
          status: Number(value.status),
        };
        await mutateAsync(payload);
        message.success("Registro actualizado correctamente");
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
      title="Actualizar clima"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "45%" }}
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
        <Row>
          <Col span={24}>
            <form.Field name="status">
              {(field) => (
                <Form.Item
                  validateStatus={
                    field.state.meta.errors.length ? "error" : undefined
                  }
                  help={field.state.meta.errors[0]?.message}
                >
                  <Radio.Group
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    options={[
                      { value: 0, label: "Pendiente" },
                      { value: 1, label: "Renovado" },
                      { value: 2, label: "No renovado" },
                    ]}
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
