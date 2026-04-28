import { useForm, useStore } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
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
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import InputSearch from "../../../../components/molecules/input/InputSearch";
import { useToggle } from "../../../../hooks/Toggle";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import type { RegistrarIngresoMercaderiaCreateApiType } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import { useCreateIngresoMercaderia } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { v4 as uuidv4 } from "uuid";
import { useCatalogoMercaderiaList } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api";
import { useProveedoresListaList } from "../../../../api/queries/modulos/administracion/lista/proveedores/proveedoresLista.api";
import ModalCreateProveedoresLista from "../../../administracion/lista/proveedores/ModalListaCreateListaProv";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";
import { SerieItem } from "../../../../components/molecules/upload/arrayCompuestoImagen";

const { Text } = Typography;

const ItemsSeries = z.object({
  cantidad: z.number().min(1, "Requerido"),
  codigo: z.string().min(3, "Requerido"),
  image: z
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Requerido"),
});

const ProductoSchema = z.object({
  uuid_mercaderia: z.string(),
  codigo: z.string().min(3, "Requerido"),
  name: z.string().min(3, "Requerido"),
  marca: z.string().min(2, "Requerido"),
  modelo: z.string().min(2, "Requerido"),
  medida: z.string().min(2, "Requerido"),
  dimension: z.string().min(3, "Requerido"),
  categoria: z.string().min(3, "Requerido"),
  serie: z.array(ItemsSeries).min(1, "Requerido"),
  cantidad: z.number().min(0, "Requerido"),
  valor: z.number().min(0.0001, "Requerido"),
  image: z.array(
    z.object({
      image_byte: z.string(),
    }),
  ),
  ubicacion: z.string().min(3, "Requerido"),
});

export type ProductoType = z.infer<typeof ProductoSchema>;

const RegistrarProductosProveedorSchema = z.object({
  ruc: z.string().min(1, "Requerido").max(11, "Máximo 11 números"),
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

// Función helper para convertir base64 a Blob
const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export function ModalProducto({
  open,
  onClose,
  onSave,
  initialValues,
}: ModalProps) {
  const createMercaderia = useToggle();
  const { data: dataMercaderia } = useCatalogoMercaderiaList();

  const mercaderias = useMemo(
    () =>
      dataMercaderia?.map((cat) => ({ value: cat.name, label: cat.name })) ??
      [],
    [dataMercaderia],
  );

  const form = useForm({
    defaultValues: initialValues || {
      uuid_mercaderia: uuidv4(),
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      dimension: "",
      categoria: "",
      serie: [] as any[],
      cantidad: 0,
      valor: 0,
      image: [] as { image_byte: string }[],
      ubicacion: "Almacén",
    },
    validators: { onSubmit: ProductoSchema },
    onSubmit: async ({ value }) => {
      onSave(value);
      form.reset();
      onClose();
    },
  });

  const ImagenActual = useStore(form.store, (state) => state.values.image);

  return (
    <Modal
      title={
        <span className="text-xl font-bold text-gray-800 dark:text-mist-300">
          {initialValues ? "📦 Editar" : "📦 Nueva Mercadería"}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      centered
      keyboard={false}
      maskClosable={false}
      destroyOnHidden
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-4"
      >
        <div className="flex flex-col lg:flex-row gap-2">
          {/* COLUMNA IZQUIERDA: DATOS GENERALES */}
          <div className="w-full lg:w-3/5 space-y-2 bg-mist-100 p-4 rounded-xl border border-gray-200">
            <div className="flex flex-row gap-4 w-full">
              <div className="overflow-auto p-0.5">
                <form.Field name="name">
                  {(field) => (
                    <Form.Item
                      label={
                        <span className="font-semibold dark:text-mist-900 text-base">
                          Producto / Mercadería
                        </span>
                      }
                      layout="vertical"
                    >
                      <InputSearch
                        value={field.state.value}
                        handleOpen={createMercaderia.toggle}
                        ButtonName="Crear Nueva"
                        placeholder="Buscar en catálogo..."
                        options={mercaderias}
                        onChange={(val) => {
                          const stringVal = String(val || "");
                          field.handleChange(stringVal);
                          const select = dataMercaderia?.find(
                            (c) => c.name === stringVal,
                          );
                          if (select) {
                            const nuevaImagen = select.imagen1
                              ? [
                                  {
                                    image_byte: getBase64WithPrefix(
                                      select.imagen1,
                                    ),
                                  },
                                ]
                              : [];
                            form.setFieldValue("image", nuevaImagen);
                            form.setFieldValue("codigo", select.codigo || "");
                            form.setFieldValue("marca", select.marca || "");
                            form.setFieldValue("modelo", select.modelo || "");
                            form.setFieldValue("medida", select.medida || "");
                            form.setFieldValue(
                              "dimension",
                              select.dimension || "",
                            );
                            form.setFieldValue(
                              "categoria",
                              select.categoria || "",
                            );
                          }
                        }}
                      />
                    </Form.Item>
                  )}
                </form.Field>
                <div className="grid grid-cols-3 gap-4 p-0.5">
                  <div>
                    <form.Field name="valor">
                      {(field) => (
                        <Form.Item
                          label={
                            <span className="font-semibold dark:text-mist-900">
                              Valor unitario
                            </span>
                          }
                          layout="vertical"
                        >
                          <FieldWrapper field={field}>
                            {(props) => (
                              <InputNumber
                                {...props}
                                placeholder="Valor unitario"
                                type={"number"}
                                min={0}
                                maxLength={20}
                                style={{ width: "100%" }}
                              />
                            )}
                          </FieldWrapper>
                        </Form.Item>
                      )}
                    </form.Field>
                  </div>
                  <div className="col-span-2">
                    <form.Field name="ubicacion">
                      {(field) => (
                        <Form.Item
                          label={
                            <span className="font-semibold dark:text-mist-900">
                              Ubicación
                            </span>
                          }
                          layout="vertical"
                        >
                          <FieldWrapper field={field}>
                            {(props) => (
                              <Input
                                {...props}
                                placeholder="Ubicación del producto"
                                allowClear
                              />
                            )}
                          </FieldWrapper>
                        </Form.Item>
                      )}
                    </form.Field>
                  </div>
                </div>
              </div>

              {/* Imagen Principal Previsualización */}
              <form.Field name="image">
                {(field) => (
                  <div className="mt-8">
                    <Image
                      className="rounded-lg shadow-sm border bg-white"
                      width={110}
                      height={110}
                      src={field.state.value[0]?.image_byte}
                      fallback="https://placehold.co/110x110?text=Sin+Imagen"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Campos de solo lectura o informativos que vienen del catálogo */}
              {[
                { n: "codigo", l: "Código" },
                { n: "medida", l: "Medida" },
                { n: "dimension", l: "Dimensión" },
                { n: "marca", l: "Marca" },
                { n: "modelo", l: "Modelo" },
                { n: "categoria", l: "Categoría" },
              ].map((item) => (
                <form.Field key={item.n} name={item.n as any}>
                  {(field) => (
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                        {item.l}
                      </p>
                      <p className="text-gray-700 font-medium truncate">
                        {field.state.value || "—"}
                      </p>
                    </div>
                  )}
                </form.Field>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: LISTA DE SERIES */}
          <div className="w-full lg:w-2/5 flex flex-col bg-gray-50 p-2 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 px-1">
                Cantidad y series del producto
              </h3>
              <Button
                type="dashed"
                icon={<div>+</div>}
                onClick={() => {
                  // Obtenemos la imagen actual del estado del formulario
                  // Si no hay imagen, enviamos un array vacío
                  const imagenParaSerie =
                    ImagenActual && ImagenActual.length > 0 ? ImagenActual : [];

                  form.pushFieldValue("serie", {
                    cantidad: 1,
                    codigo: "",
                    image: [...imagenParaSerie], // Usamos el spread para crear una copia y evitar referencias compartidas
                  });
                }}
              >
                Agregar Serie
              </Button>
            </div>

            <div className="flex-1 overflow-auto scroll-auto max-h-90">
              <form.Field name="serie" mode="array">
                {(field) => (
                  <>
                    {field.state.value.map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 border-l-2 border-cyan-950 pl-1"
                      >
                        <span className="text-[10px] font-bold text-rose-950 uppercase">
                          Serie #{i + 1}
                        </span>
                        <SerieItem index={i} form={form} />
                      </div>
                    ))}

                    {field.state.value.length === 0 && (
                      <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
                        <p className="text-sm">
                          Presiona "Agregar Serie" para comenzar
                          <br />o define una cantidad.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex justify-end gap-3">
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={!canSubmit}
                className="rounded-lg px-8 bg-indigo-600 hover:bg-indigo-700"
              >
                Agregar
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

function ComponenteRegistrarProductosFinal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateIngresoMercaderia();
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
      const formData = new FormData();

      try {
        // 1. Construimos el objeto JSON siguiendo estrictamente el tipo de la API
        // Usamos el tipo para asegurar que no falten campos ni sobren (como el 'image' del producto)
        // ... dentro del onSubmit ...

        const jsonData: RegistrarIngresoMercaderiaCreateApiType = {
          ruc: value.ruc,
          proveedor: value.proveedor,
          serieNumCP: value.serieNumCP.trim().toUpperCase() || null,
          serieNumGR: value.serieNumGR.trim().toUpperCase() || null,
          condicion: value.condicion,
          fecha: value.fecha,
          moneda: value.moneda,
          productos: value.productos.map((p, pIdx) => {
            // 1. Extraemos 'image' del nivel producto (catálogo) para ignorarla
            const { image, cantidad, ...datosProducto } = p;
            return {
              ...datosProducto,
              serie: p.serie.map((s, sIdx) => {
                // 2. Adjuntamos al FormData si existe la imagen
                if (s.image?.[0]?.image_byte) {
                  const blob = dataURLtoBlob(s.image[0].image_byte);
                  formData.append("files", blob, `image_${pIdx}_${sIdx}.jpg`);
                }

                // 3. RETORNO CORREGIDO:
                // Enviamos el código y un array de imagen vacío para satisfacer al Tipo/Zod
                return {
                  codigo: s.codigo,
                  cantidad: s.cantidad,
                  image: [], // <-- Esto soluciona el error de TypeScript
                };
              }),
            };
          }),
        };

        // 2. Adjuntamos el JSON como un string
        formData.append("data", JSON.stringify(jsonData));

        // 3. Enviamos usando la mutación
        // Nota: mutateAsync ahora debe recibir el FormData
        await mutateAsync(formData as any);

        message.success("Registro exitoso");
        formApi.reset();
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioField);
          if (err.kind !== "validation") message.error(err.message);
        } else {
          message.error("Error inesperado al procesar el formulario");
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
      title="Registro de ingreso de Mercaderías"
      style={{ margin: "auto" }}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={"90%"}
      maskClosable={false}
      keyboard={false}
    >
      <ModalCreateProveedoresLista
        open={ModalProveedor.isToggled}
        onClose={() => ModalProveedor.setOff()}
      />

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
                      maxLength={10}
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
                            <Button
                              type="primary"
                              onClick={() => ModalProveedor.toggle()}
                            >
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
            <Col span={6}>Descripción</Col>
            <Col span={2}>Marca</Col>
            <Col span={2}>Modelo</Col>
            <Col span={2}>Medida</Col>
            <Col span={2}>Dimensión</Col>
            <Col span={2}>Categoría</Col>
            <Col span={2}>Cantidad</Col>
            <Col span={2}>Precio</Col>
            <Col span={1}>Series</Col>
            <Col span={2} style={{ display: "flex", justifyContent: "center" }}>
              Acciones
            </Col>
          </Row>

          {/* SECCIÓN DINÁMICA DE PRODUCTOS */}
          <form.Field name="productos" mode="array">
            {(field) => (
              <>
                <div style={{ marginTop: 16 }}>
                  {field.state.value.map((p, i) => {
                    const totalCantidad = p.serie.reduce(
                      (acc, s) => acc + (Number(s.cantidad) || 0),
                      0,
                    );
                    return (
                      <Row
                        gutter={2}
                        key={i}
                        style={{
                          minWidth: "1200px",
                          margin: "auto",
                          marginBottom: 5,
                        }}
                      >
                        <Col span={1}>
                          <Image
                            className="rounded-lg border"
                            width={22}
                            height={22}
                            src={p.image[0]?.image_byte}
                            fallback="https://placehold.co/110x110?text=Sin+Imagen"
                          />
                        </Col>
                        <Col span={6}>
                          <Text ellipsis={{ tooltip: p.name }}>{p.name}</Text>
                        </Col>
                        <Col span={2}>
                          <Text ellipsis={{ tooltip: p.marca }}>{p.marca}</Text>
                        </Col>
                        <Col span={2}>
                          <Text ellipsis={{ tooltip: p.modelo }}>
                            {p.modelo}
                          </Text>
                        </Col>
                        <Col span={2}>
                          <Text ellipsis={{ tooltip: p.medida }}>
                            {p.medida}
                          </Text>
                        </Col>
                        <Col span={2}>
                          <Text ellipsis={{ tooltip: p.dimension }}>
                            {p.dimension}
                          </Text>
                        </Col>
                        <Col span={2}>
                          <Text ellipsis={{ tooltip: p.categoria }}>
                            {p.categoria}
                          </Text>
                        </Col>
                        <Col span={2}>{totalCantidad}</Col>
                        <Col span={2}>{p.valor}</Col>
                        <Col span={1}>{p.serie.length}</Col>
                        <Col span={2}>
                          <Row justify={"center"} gutter={2}>
                            <Space size="small">
                              <ButtonUpdate
                                onClick={() => handleEditClick(i)}
                              />
                              <ButtonDelete
                                onClick={() => field.removeValue(i)}
                              />
                            </Space>
                          </Row>
                        </Col>
                      </Row>
                    );
                  })}
                </div>

                {/* INTEGRACIÓN DEL MODAL DUAL */}
                <ModalProducto
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

export default ComponenteRegistrarProductosFinal;
