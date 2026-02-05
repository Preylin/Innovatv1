import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import FormUploadImage from "../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import InputSearch from "../../../../components/molecules/input/InputSearch";
import { useToggle } from "../../../../hooks/Toggle";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { useCreateIngresoMaterial } from "../../../../api/queries/modulos/almacen/ingresos/material.api";
import type { RegistrarIngresoMaterialCreateApiType } from "../../../../api/queries/modulos/almacen/ingresos/material.api.schema";
import CatalogoMaterialesCreate from "../../catalogos/materiales/CrearCatalogoMaterial";
import { useCatalogoMaterialList } from "../../../../api/queries/modulos/almacen/catalogos/materiales/material.api";
import TextArea from "antd/es/input/TextArea";
import { useProveedoresListaList } from "../../../../api/queries/modulos/administracion/lista/proveedores/proveedoresLista.api";
import ModalCreateProveedoresLista from "../../../administracion/lista/proveedores/ModalListaCreateListaProv";
const { Text } = Typography;

const ProductoSchema = z.object({
  uuid_material: z.string(),
  codigo: z.string(),
  name: z.string().min(3, "Requerido"),
  marca: z.string().min(3, "Requerido"),
  modelo: z.string().min(3, "Requerido"),
  medida: z.string().min(3, "Requerido"),
  dimension: z.string().min(3, "Requerido"),
  tipo: z.string().min(3, "Requerido"),
  serie: z.string().min(3, "Requerido"),
  cantidad: z.number().min(1, "Requerido"),
  valor: z.number().min(1, "Requerido"),
  image: z
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Requerido"),
  ubicacion: z.string().min(3, "Requerido"),
});

export type ProductoType = z.infer<typeof ProductoSchema>;

const RegistrarProductosProveedorSchema = z.object({
  ruc: z.string().max(11, "Máximo 11 números"),
  proveedor: z.string().min(3, "Requerido"),
  serieNumCP: z.string(),
  serieNumGR: z.string(),
  condicion: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Seleccione una fecha"),
  moneda: z.string().min(1, "Requerido"),
  productos: z.array(ProductoSchema).min(1, "Requerido"),
});

type UsuarioField = keyof typeof RegistrarProductosProveedorSchema.shape;
const uiFields = Object.keys(
  RegistrarProductosProveedorSchema.shape,
) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (producto: ProductoType) => void;
  initialValues?: ProductoType | null; // Null para creación
}

function ModalProductoMaterial({
  open,
  onClose,
  onSave,
  initialValues,
}: ModalProps) {
  const createMercaderia = useToggle();

  const { data: dataMaterial } = useCatalogoMaterialList();

  const material = useMemo(() => {
    return (
      dataMaterial?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) ?? []
    );
  }, [dataMaterial]);

  const optionsdimension = [
    {
      value: "...",
      label: "Agregar otra dimensión",
      disabled: true,
    },
  ];

  const form = useForm({
    defaultValues: initialValues || {
      uuid_material: uuidv4(),
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      dimension: "",
      tipo: "",
      serie: "",
      cantidad: 0,
      valor: 0,
      image: [] as { image_byte: string }[],
      ubicacion: "",
    },
    validators: { onSubmit: ProductoSchema },
    onSubmit: async ({ value }) => {
      onSave(value);
      form.reset();
    },
  });

  return (
    <Modal
      title={initialValues ? "Editar Material" : "Nuevo Material"}
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      forceRender
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
      maskClosable={false}
    >
      <CatalogoMaterialesCreate
        open={createMercaderia.isToggled}
        onClose={() => createMercaderia.setOff()}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Row>
          <Col span={24}>
            <form.Field name="image">
              {(field) => (
                <Flex justify="center" align="center">
                  <FieldWrapper field={field}>
                    {(props) => (
                      <Flex justify="center" align="center">
                        <FormUploadImage
                          {...props}
                          field={field}
                          maxFiles={1}
                        />
                      </Flex>
                    )}
                  </FieldWrapper>
                </Flex>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={6}>
          <Col xs={24} md={12}>
            <form.Field name="name">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <InputSearch
                      {...props}
                      handleOpen={createMercaderia.toggle}
                      ButtonName="Crear Material"
                      placeholder="Descripción del producto"
                      options={material}
                      onChange={(val) => {
                        const stringVal = val ? String(val) : "";

                        field.handleChange(stringVal);

                        const producSelect = dataMaterial?.find(
                          (c) => c.name === stringVal,
                        );

                        if (producSelect) {
                          field.form.setFieldValue(
                            "codigo",
                            producSelect.codigo || "",
                          );
                          field.form.setFieldValue(
                            "marca",
                            producSelect.marca || "",
                          );
                          field.form.setFieldValue(
                            "modelo",
                            producSelect.modelo || "",
                          );
                          field.form.setFieldValue(
                            "medida",
                            producSelect.medida || "",
                          );
                          field.form.setFieldValue(
                            "dimension",
                            producSelect.dimension || "",
                          );
                          field.form.setFieldValue(
                            "tipo",
                            producSelect.tipo || "",
                          );
                        }
                      }}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="codigo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Código"
                      allowClear
                      maxLength={20}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="marca">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Marca"
                      allowClear
                      maxLength={100}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="modelo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Modelo"
                      allowClear
                      maxLength={100}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="medida">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Medida"
                      allowClear
                      maxLength={20}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="dimension">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      options={optionsdimension}
                      placeholder="Dimensión"
                      allowClear
                      maxLength={100}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="tipo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Tipo"
                      allowClear
                      maxLength={100}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="serie">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Serie o código único"
                      allowClear
                      maxLength={100}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="cantidad">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <InputNumber
                      {...props}
                      placeholder="C.U"
                      min={0}
                      maxLength={20}
                      style={{ width: "100%" }}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="valor">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <InputNumber
                      {...props}
                      placeholder="V.U"
                      min={0}
                      style={{ width: "100%" }}
                      maxLength={20}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col span={24}>
            <form.Field name="ubicacion">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <TextArea
                      {...props}
                      placeholder="Ubicación de almacenaje"
                    />
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
                Agregar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Modal>
  );
}

function ModalRegistrarIngresoMaterial({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateIngresoMaterial();
  const { message } = App.useApp();
  const itemModal = useToggle();
  const ModalProveedor = useToggle();
  const { data: dataProveedor } = useProveedoresListaList();

  const opciones = useMemo(() => {
    return (
      dataProveedor?.map((c) => ({
        value: c.proveedor,
        label: c.proveedor,
      })) ?? []
    );
  }, [dataProveedor]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const optioncondicion = [
    {
      value: "COMPRA",
      label: "Compra",
    },
    {
      value: "DEVOLUCION1",
      label: "Devolución (Producción)",
    },
    {
      value: "DEVOLUCION2",
      label: "Devolución (Cliente)",
    },
    {
      value: "REPOSICION",
      label: "Reposición (Proveedor)",
    },
    {
      value: "REINTEGRO",
      label: "Reintegro (Uso interno)",
    },
    {
      value: "REGALO",
      label: "Regalo",
    },
  ];

  const form = useForm({
    defaultValues: {
      ruc: "",
      proveedor: "",
      serieNumCP: "",
      serieNumGR: "",
      condicion: "",
      fecha: "",
      moneda: "",
      productos: [] as ProductoType[],
    },
    validators: { onSubmit: RegistrarProductosProveedorSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: RegistrarIngresoMaterialCreateApiType = {
          ...value,
          serieNumCP: value.serieNumCP.trim() || null,
          serieNumGR: value.serieNumGR.trim() || null,
          productos: value.productos.map((p) => ({
            ...p,
            image: p.image.map((i) => ({
              image_byte: i.image_byte.split(",")[1] || "",
            })),
          })),
        };
        await mutateAsync(payload);
        message.success("Registro exitoso");
        formApi.reset();
        itemModal.setOff();
        setEditingIndex(null);
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

  // Helper para abrir el modal en modo edición
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    itemModal.toggle();
  };

  return (
    <Modal
      title="Registro de ingreso de Materiales"
      style={{ margin: "auto" }}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={"90%"}
      maskClosable={false}
    >
      <ModalCreateProveedoresLista open={ModalProveedor.isToggled} onClose={() => ModalProveedor.setOff()}/>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* SECCIÓN DATOS GENERALES */}
        <Row gutter={16}>
          <Col xs={24} lg={6}>
            <form.Field name="fecha">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <DatePicker
                      {...props}
                      placeholder="Fecha emisión del CP"
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
          <Col xs={24} lg={6}>
            <form.Field name="serieNumCP">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Serie y Número CP"
                      allowClear
                      maxLength={50}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={6}>
            <form.Field name="serieNumGR">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Serie y Número GR"
                      allowClear
                      maxLength={50}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={6}>
            <form.Field name="moneda">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Select
                      {...props}
                      options={[
                        {
                          value: "S/",
                          label: "Soles",
                        },
                        {
                          value: "$",
                          label: "Dólares",
                        },
                      ]}
                      placeholder="Seleccionar moneda"
                      allowClear
                      value={props.value === "" ? undefined : props.value}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={9}>
            <form.Field name="proveedor">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Select
                      {...props}
                      allowClear
                      showSearch={{
                        optionFilterProp: "label",
                        filterOption: (input, option) => {
                          return (option?.label ?? "")
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase());
                        },
                      }}
                      placeholder="Selecciona el proveedor"
                      options={opciones}
                      popupRender={(menu) => (
                        <>
                          {menu}
                          <Flex wrap justify="end" align="center">
                            <Button type="primary" onClick={() => ModalProveedor.toggle()}>
                              Nuevo Proveedor
                            </Button>
                          </Flex>
                        </>
                      )}
                      value={props.value === "" ? undefined : props.value}
                      onChange={(value) => {
                        field.handleChange(value as string);
                        const proveedorSeleccionado = dataProveedor?.find(
                          (c) => c.proveedor === value,
                        );
                        if (proveedorSeleccionado) {
                          field.form.setFieldValue(
                            "ruc",
                            proveedorSeleccionado.ruc || "",
                          );
                        }
                      }}
                      onBlur={field.handleBlur}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={6}>
            <form.Field name="ruc">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => <Input {...props} placeholder="RUC" disabled />}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={5}>
            <form.Field name="condicion">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      options={optioncondicion}
                      placeholder="Condición de ingreso"
                      allowClear
                      value={props.value === "" ? undefined : props.value}
                      maxLength={50}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={4}>
            <Button
              block
              type="dashed"
              onClick={() => {
                setEditingIndex(null);
                itemModal.toggle();
              }}
            >
              + Agregar
            </Button>
          </Col>
        </Row>
        <Divider>Listado de Productos</Divider>
        <div className="overflow-auto mb-4" style={{ maxHeight: "350px" }}>
          <Row gutter={1} style={{ minWidth: "1200px", margin: "auto" }}>
            <Col span={1}>Imagen</Col>
            <Col span={5}>Descripción</Col>
            <Col span={2}>Marca</Col>
            <Col span={2}>Modelo</Col>
            <Col span={2}>Medida</Col>
            <Col span={2}>Dimensión</Col>
            <Col span={2}>Tipo</Col>
            <Col span={2}>Serie</Col>
            <Col span={2}>Cantidad</Col>
            <Col span={2}>Precio</Col>
            <Col span={2} style={{ display: "flex", justifyContent: "center" }}>
              Acciones
            </Col>
          </Row>

          {/* SECCIÓN DINÁMICA DE PRODUCTOS */}
          <form.Field name="productos" mode="array">
            {(field) => (
              <>
                <div style={{ marginTop: 16 }}>
                  {field.state.value.map((p, i) => (
                    <Row
                      gutter={1}
                      key={i}
                      style={{
                        minWidth: "1200px",
                        margin: "auto",
                        marginBottom: 10,
                      }}
                    >
                      <Col span={1}>
                        <Flex align="center" justify="center">
                          {p.image.map((img, index) => (
                            <Image
                              key={index}
                              src={img.image_byte}
                              style={{ borderRadius: "10%" }}
                              width={20}
                              height={20}
                            />
                          ))}
                        </Flex>
                      </Col>
                      <Col span={5}>
                        <Text ellipsis={{ tooltip: p.name }}>{p.name}</Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.marca }}>{p.marca}</Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.modelo }}>{p.modelo}</Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.medida }}>{p.medida}</Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.dimension }}>
                          {p.dimension}
                        </Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.tipo }}>{p.tipo}</Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.serie }}>{p.serie}</Text>
                      </Col>
                      <Col span={2}>{p.cantidad}</Col>
                      <Col span={2}>{p.valor}</Col>
                      <Col span={2}>
                        <Row justify={"center"} gutter={2}>
                          <Space size="small">
                            <ButtonUpdate onClick={() => handleEditClick(i)} />
                            <ButtonDelete
                              onClick={() => field.removeValue(i)}
                            />
                          </Space>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </div>

                {/* INTEGRACIÓN DEL MODAL DUAL */}
                <ModalProductoMaterial
                  open={itemModal.isToggled}
                  initialValues={
                    editingIndex !== null
                      ? field.state.value[editingIndex]
                      : null
                  }
                  onClose={() => {
                    itemModal.setOff();
                    setEditingIndex(null);
                  }}
                  onSave={(data) => {
                    if (editingIndex !== null) {
                      // MODO EDICIÓN: Reemplaza el valor en la posición específica
                      field.insertValue(editingIndex, data);
                      field.removeValue(editingIndex + 1);
                    } else {
                      // MODO CREACIÓN
                      field.pushValue(data);
                    }
                    itemModal.setOff();
                    setEditingIndex(null);
                  }}
                />
              </>
            )}
          </form.Field>
        </div>
        <Divider />

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

export default ModalRegistrarIngresoMaterial;
