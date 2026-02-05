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
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import FormUploadImage from "../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import InputSearch from "../../../../components/molecules/input/InputSearch";
import { useToggle } from "../../../../hooks/Toggle";
import CatalogoMercaderiaCreate from "../../catalogos/mercaderias/CrearCatalogoMercaderia";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import type { RegistrarSalidaMercaderiaCreateApiType } from "../../../../api/queries/modulos/almacen/salidas/mercaderia.api.schema";
import { useCreateSalidaMercaderia } from "../../../../api/queries/modulos/almacen/salidas/mercaderia.api";
import { useCatalogoStockDetalladoMercaderiaList } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";
import { useClientesListaList } from "../../../../api/queries/modulos/administracion/lista/clientes/clientesLista.api";
import ModalCreateClientesLista from "../../../administracion/lista/clientes/ModalListaCreateLista";
const { Text } = Typography;

const ProductoSchema = z.object({
  n_serie: z.string(),
  uuid_mercaderia: z.string(),
  codigo: z.string(),
  name: z.string().min(3, "Requerido"),
  marca: z.string().min(3, "Requerido"),
  modelo: z.string().min(3, "Requerido"),
  medida: z.string().min(3, "Requerido"),
  dimension: z.string().min(3, "Requerido"),
  categoria: z.string().min(3, "Requerido"),
  serie: z.string().min(3, "Requerido"),
  cantidad: z.number().min(1, "Requerido"),
  valor: z.number().min(1, "Requerido"),
  moneda: z.string().min(1, "Requerido"),
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

export type ProductoType = z.infer<typeof ProductoSchema>;

const RegistrarProductosClienteSchema = z.object({
  ruc: z.string().min(1, "Requerido").max(11, "Máximo 11 números"),
  cliente: z.string().min(3, "Requerido"),
  serieNumGR: z.string(),
  condicion: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Seleccione una fecha"),
  adicional: z.string(),
  productos: z.array(ProductoSchema).min(1, "Requerido"),
});

type UsuarioField = keyof typeof RegistrarProductosClienteSchema.shape;
const uiFields = Object.keys(
  RegistrarProductosClienteSchema.shape,
) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};

// 2. Interfaz del Detalle (Hijo)
interface Detalle {
  codigo: string;
  uuid_registro: string;
  marca: string;
  modelo: string;
  medida: string;
  dimension: string;
  categoria: string;
  cantidad: number;
  valor: number;
  moneda: string;
  fecha_ingreso: string;
  image_byte: string;
}

// Representa el agrupamiento interno: la llave es el string de la serie
type SeriesMap = Record<string, Detalle[]>;

interface ProductoAgrupado {
  name: string;
  series: SeriesMap;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (producto: ProductoType) => void;
  initialValues?: ProductoType | null; // Null para creación
}

function ModalProducto({ open, onClose, onSave, initialValues }: ModalProps) {
  const [cantidadMax, setCantidadMax] = useState<number>(0);
  const createMercaderia = useToggle();

  const { data: data2 } = useCatalogoStockDetalladoMercaderiaList();

  const productosAgrupados = useMemo(() => {
    if (!data2) return {};

    const inicial: Record<string, ProductoAgrupado> = {};

    return data2.reduce((acc, item) => {
      const { codigo, name, serie } = item;

      const nuevoDetalle: Detalle = {
        codigo: item.codigo,
        uuid_registro: item.uuid_registro,
        marca: item.marca,
        modelo: item.modelo,
        medida: item.medida,
        dimension: item.dimension,
        categoria: item.categoria,
        cantidad: item.stock_actual,
        valor: item.valor,
        moneda: item.moneda,
        fecha_ingreso: item.fecha_ingreso,
        image_byte: item.image_byte,
      };

      // 1. Inicializar el grupo por Nombre
      if (!acc[codigo]) {
        acc[codigo] = {
          name: name,
          series: {
            [serie]: [nuevoDetalle],
          },
        };
      } else {
        // 2. Inicializar o agregar al grupo por Serie
        if (!acc[codigo].series[serie]) {
          acc[codigo].series[serie] = [nuevoDetalle];
        } else {
          acc[codigo].series[serie].push(nuevoDetalle);
        }
      }

      return acc;
    }, inicial);
  }, [data2]); // Solo se recalcula si data2 cambia

  const opcionesProductos = useMemo(() => {
    return Object.entries(productosAgrupados).map(([codigo, producto]) => ({
      label: `${codigo} - ${producto.name}`, // Mostramos ambos para el usuario
      value: codigo, // Usamos el código como valor único para TanStack Form
    }));
  }, [productosAgrupados]);

  const form = useForm({
    defaultValues: initialValues || {
      n_serie: "",
      uuid_mercaderia: "",
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      dimension: "",
      categoria: "",
      serie: "",
      cantidad: 0,
      valor: 0,
      moneda: "",
      image: [] as { image_byte: string }[],
    },
    validators: { onSubmit: ProductoSchema },
    onSubmit: async ({ value }) => {
      onSave(value);
      form.reset();
      setCantidadMax(0);
    },
  });

  return (
    <Modal
      title={
        <Flex justify={"space-between"} style={{ marginRight: 25 }}>
          <Text>
            {initialValues ? "Editar Mercadería" : "Nueva Mercadería"}
          </Text>
          <Text style={{ color: "#B55989" }}>
            {cantidadMax === 0 ? "" : `Stock disponible: ${cantidadMax}`}
          </Text>
        </Flex>
      }
      open={open}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
      maskClosable={false}
    >
      <CatalogoMercaderiaCreate
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
                      ButtonName="Crear Mercadería"
                      placeholder="Descripción del producto"
                      options={opcionesProductos} // value es el codigo
                      onChange={(codigoSeleccionado) => {
                        const codStr = codigoSeleccionado
                          ? String(codigoSeleccionado)
                          : "";
                        const productoAgrupado = productosAgrupados[codStr];

                        if (productoAgrupado) {
                          // Seteamos solo lo básico del producto
                          field.handleChange(productoAgrupado.name);
                          field.form.setFieldValue("codigo", codStr);

                          // IMPORTANTE: Limpiamos los campos dependientes de la serie
                          field.form.setFieldValue("serie", "");
                          field.form.setFieldValue("n_serie", "");
                          field.form.setFieldValue("marca", "");
                          field.form.setFieldValue("modelo", "");
                          field.form.setFieldValue("medida", "");
                          field.form.setFieldValue("dimension", "");
                          field.form.setFieldValue("categoria", "");
                          field.form.setFieldValue("valor", 0);
                          field.form.setFieldValue("cantidad", 0);
                          field.form.setFieldValue("moneda", "");
                          field.form.setFieldValue("uuid_mercaderia", "");
                          field.form.setFieldValue("image", []);
                          setCantidadMax(0);
                        }
                      }}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={14} md={7}>
            {/* Suscribimos este bloque al valor de 'codigo' */}
            <form.Subscribe selector={(state) => state.values.codigo}>
              {(codigoActual) => (
                <form.Field name="serie">
                  {(field) => {
                    const seriesDisponibles =
                      productosAgrupados[codigoActual]?.series || {};
                    const opcionesSeries = Object.keys(seriesDisponibles).map(
                      (s) => ({
                        label: s,
                        value: s,
                      }),
                    );

                    return (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Select
                            {...props}
                            placeholder="Serie"
                            options={opcionesSeries}
                            // Forzamos el valor del field para asegurar sincronía
                            value={field.state.value || undefined}
                            disabled={!codigoActual}
                            onChange={(serieElegida) => {
                              field.handleChange(serieElegida);
                              // Limpiar hijos
                              field.form.setFieldValue("n_serie", "");
                              setCantidadMax(0);
                            }}
                          />
                        )}
                      </FieldWrapper>
                    );
                  }}
                </form.Field>
              )}
            </form.Subscribe>
          </Col>

          <Col xs={10} md={5}>
            {/* Suscribimos este bloque a 'codigo' y 'serie' */}
            <form.Subscribe
              selector={(state) => [state.values.codigo, state.values.serie]}
            >
              {([codigoActual, serieActual]) => (
                <form.Field name="n_serie">
                  {(field) => {
                    const variantes =
                      productosAgrupados[codigoActual]?.series[serieActual] ||
                      [];
                    const opcionesVariantes = variantes.map((item, index) => ({
                      label: `Stock: ${item.cantidad} - Precio: ${item.moneda}${item.valor}`,
                      value: index,
                    }));

                    return (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Select
                            {...props}
                            placeholder="Mercadería"
                            options={opcionesVariantes}
                            // Sincronizamos el valor visual con el estado del form
                            value={
                              field.state.value === ""
                                ? undefined
                                : field.state.value
                            }
                            disabled={variantes.length === 0}
                            onChange={(index) => {
                              const seleccionado = variantes[Number(index)];
                              if (seleccionado) {
                                field.handleChange(`Lote ${Number(index) + 1}`);

                                // Actualización masiva
                                field.form.setFieldValue(
                                  "marca",
                                  seleccionado.marca,
                                );
                                field.form.setFieldValue(
                                  "modelo",
                                  seleccionado.modelo,
                                );
                                field.form.setFieldValue(
                                  "medida",
                                  seleccionado.medida,
                                );
                                field.form.setFieldValue(
                                  "dimension",
                                  seleccionado.dimension,
                                );
                                field.form.setFieldValue(
                                  "categoria",
                                  seleccionado.categoria,
                                );
                                field.form.setFieldValue(
                                  "valor",
                                  seleccionado.valor,
                                );
                                field.form.setFieldValue(
                                  "moneda",
                                  seleccionado.moneda,
                                );
                                field.form.setFieldValue(
                                  "uuid_mercaderia",
                                  seleccionado.uuid_registro,
                                );

                                field.form.setFieldValue(
                                  "image",
                                  seleccionado.image_byte
                                    ? [
                                        {
                                          image_byte: getBase64WithPrefix(
                                            seleccionado.image_byte,
                                          ),
                                        },
                                      ]
                                    : [],
                                );

                                setCantidadMax(seleccionado.cantidad);
                                field.form.setFieldValue("cantidad", 0);
                              }
                            }}
                          />
                        )}
                      </FieldWrapper>
                    );
                  }}
                </form.Field>
              )}
            </form.Subscribe>
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                    <Input
                      {...props}
                      placeholder="Dimensión"
                      allowClear
                      maxLength={100}
                      disabled
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} md={12}>
            <form.Field name="categoria">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Categoría"
                      allowClear
                      maxLength={100}
                      disabled
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
                      maxLength={20}
                      style={{ width: "100%" }}
                      min={0}
                      max={cantidadMax}
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
                      type={"number"}
                      min={0}
                      maxLength={20}
                      style={{ width: "100%" }}
                      disabled
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col span={0}>
            <form.Field name="uuid_mercaderia">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} style={{ width: "100%" }} disabled />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col span={0}>
            <form.Field name="moneda">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => <Input {...props} disabled />}
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

function ComponenteRegistrarProductosFinal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateSalidaMercaderia();
  const { message } = App.useApp();
  const itemModal = useToggle();
  const ModalCliente = useToggle();
  const { data: dataCliente } = useClientesListaList();

  const opciones = useMemo(() => {
    return (
      dataCliente?.map((c) => ({
        value: c.cliente,
        label: c.cliente,
      })) ?? []
    );
  }, [dataCliente]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const optioncondicion = [
    {
      value: "VENTA",
      label: "Venta",
    },
    {
      value: "DEVOLUCION",
      label: "Devolución (Proveedor)",
    },
    {
      value: "REPOSICION",
      label: "Reposición (Cliente)",
    },
    {
      value: "USO INTERNO",
      label: "Uso interno",
    },
    {
      value: "REGALO",
      label: "Regalo",
    },
  ];

  const form = useForm({
    defaultValues: {
      ruc: "",
      cliente: "",
      serieNumGR: "",
      condicion: "",
      fecha: "",
      adicional: "",
      productos: [] as ProductoType[],
    },
    validators: { onSubmit: RegistrarProductosClienteSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: RegistrarSalidaMercaderiaCreateApiType = {
          ...value,
          serieNumGR: value.serieNumGR.trim() || null,
          adicional: value.adicional.trim() || null,
          productos: value.productos.map((p) => ({
            uuid_mercaderia: p.uuid_mercaderia,
            codigo: p.codigo,
            name: p.name,
            marca: p.marca,
            modelo: p.modelo,
            medida: p.medida,
            dimension: p.dimension,
            categoria: p.categoria,
            serie: p.serie,
            cantidad: p.cantidad,
            valor: p.valor,
            moneda: p.moneda,
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
      title="Registro de salida de Mercaderías"
      style={{ margin: "auto" }}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={"90%"}
      maskClosable={false}
    >
      <ModalCreateClientesLista
        open={ModalCliente.isToggled}
        onClose={() => ModalCliente.setOff()}
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
          <Col xs={12} lg={5}>
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
          <Col xs={12} lg={9}>
            <form.Field name="cliente">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Select
                      {...props}
                      showSearch={{
                        optionFilterProp: "label",
                        filterOption: (input, option) => {
                          return (option?.label ?? "")
                            .toString()
                            .toLowerCase()
                            .includes(input.toLowerCase());
                        },
                      }}
                      placeholder="Selecciona el cliente"
                      options={opciones}
                      popupRender={(menu) => (
                        <>
                          {menu}
                          <Flex wrap justify="end" align="center">
                            <Button
                              type="primary"
                              onClick={() => ModalCliente.toggle()}
                            >
                              Nuevo Cliente
                            </Button>
                          </Flex>
                        </>
                      )}
                      value={props.value === "" ? undefined : props.value}
                      onChange={(value) => {
                        field.handleChange(value as string);
                        const clienteSeleccionado = dataCliente?.find(
                          (c) => c.cliente === value,
                        );
                        if (clienteSeleccionado) {
                          field.form.setFieldValue(
                            "ruc",
                            clienteSeleccionado.ruc || "",
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
          <Col xs={12} lg={5}>
            <form.Field name="ruc">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => <Input {...props} placeholder="RUC" disabled />}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={12} lg={5}>
            <form.Field name="condicion">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      options={optioncondicion}
                      placeholder="Condición de Salida"
                      allowClear
                      maxLength={50}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={12} lg={5}>
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
          <Col xs={12} lg={15}>
            <form.Field name="adicional">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Observaciones adicionales"
                      allowClear
                      maxLength={200}
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
            <Col span={2}>Categoría</Col>
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
                        <Text ellipsis={{ tooltip: p.categoria }}>
                          {p.categoria}
                        </Text>
                      </Col>
                      <Col span={2}>
                        <Text ellipsis={{ tooltip: p.serie }}>{p.serie}</Text>
                      </Col>
                      <Col span={2}>{p.cantidad}</Col>
                      <Col span={2}>
                        {p.moneda} {p.valor}
                      </Col>
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
