import { useForm, useStore } from "@tanstack/react-form";
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
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import z from "zod";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import FormUploadImage from "../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import InputSearch from "../../../../components/molecules/input/InputSearch";
import { useToggle } from "../../../../hooks/Toggle";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import CatalogoMaterialesCreate from "../../catalogos/materiales/CrearCatalogoMaterial";
import type { RegistrarSalidaMaterialCreateApiType } from "../../../../api/queries/modulos/almacen/salidas/material.api.schema";
import { useCreateSalidaMaterial } from "../../../../api/queries/modulos/almacen/salidas/material.api";
import { useCatalogoStockDetalladoMaterialList } from "../../../../api/queries/modulos/almacen/ingresos/material.api";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";
import { useClientesListaList } from "../../../../api/queries/modulos/administracion/lista/clientes/clientesLista.api";
const { Text } = Typography;

const ProductoSchema = z.object({
  n_serie: z.string(),
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
  ruc: z.string().max(11, "Máximo 11 números"),
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
  tipo: string;
  cantidad: number;
  valor: number;
  moneda: string;
  fecha_ingreso: string;
  image_byte: string;
}

// Estructura mejorada para el Map
type ProductoMap = Map<string, ProductoAgrupado>;

interface ProductoAgrupado {
  name: string;
  series: Map<string, Detalle[]>; // Series también como Map para acceso rápido
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (producto: ProductoType) => void;
  dataStock: any[];
  productosYaSeleccionados: any[];
}

function ModalProductoMaterial({
  open,
  onClose,
  onSave,
  productosYaSeleccionados,
  dataStock,
}: ModalProps) {
  const createMercaderia = useToggle();

  // 1. Agrupación de datos con cálculo de stock disponible
  const productosMap = useMemo(() => {
    const map: ProductoMap = new Map();

    dataStock.forEach((item) => {
      // 1. Calcular cuánto se ha usado ya en el carrito
      const cantidadEnCarrito = productosYaSeleccionados
        .filter((p) => {
          // IMPORTANTE: Usa uuid_material (o el que guardes en el formulario)
          const esMismoLote = p.uuid_material === item.uuid_registro;

          return esMismoLote;
        })
        .reduce((sum, curr) => sum + curr.cantidad, 0);

      // 2. Stock real para el usuario
      const stockDisponible = item.stock_actual - cantidadEnCarrito;

      // 4. Agrupación en el Map (Tu lógica actual corregida)
      if (!map.has(item.codigo)) {
        map.set(item.codigo, {
          name: item.name,
          series: new Map(),
        });
      }

      const producto = map.get(item.codigo)!;

      if (!producto.series.has(item.serie)) {
        producto.series.set(item.serie, []);
      }

      producto.series.get(item.serie)!.push({
        ...item,
        uuid_registro: item.uuid_registro,
        cantidad: stockDisponible, // Este es el valor que consumirá el 'max' del InputNumber
        valor: item.valor || 0,
      });
    });

    return map;
  }, [dataStock, productosYaSeleccionados]);

  // 2. Opciones para el primer selector (Productos)
  const opcionesProductos = useMemo(() => {
    return Array.from(productosMap.entries()).map(([codigo, producto]) => ({
      label: `${codigo} - ${producto.name}`,
      value: codigo,
    }));
  }, [productosMap]);

  const form = useForm({
    defaultValues: {
      n_serie: "",
      uuid_material: "",
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      dimension: "",
      tipo: "",
      serie: "",
      moneda: "",
      cantidad: 0,
      valor: 0,
      image: [] as { image_byte: string }[],
    },
    validators: { onSubmit: ProductoSchema },
    onSubmit: async ({ value }) => {
      onSave(value);
      form.reset();
    },
  });

  const cantidadMaxDisponible = useStore(form.store, (state) => {
    const { codigo, serie, uuid_material } = state.values;
    if (!codigo || !serie || !uuid_material) return 0;

    const variantes = productosMap.get(codigo)?.series.get(serie) || [];
    const itemSeleccionado = variantes.find(
      (v) => v.uuid_registro === uuid_material,
    );

    return itemSeleccionado ? itemSeleccionado.cantidad : 0;
  });

  return (
    <Modal
      title={
        <div className="flex flex-row justify-between mr-6">
          <Text>{"Nueva Material"}</Text>
          <h2 className="font-semibold text-xs bg-green-500 px-2 py-1 rounded-xl">
            {cantidadMaxDisponible} en stock
          </h2>
        </div>
      }
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
                      options={opcionesProductos} // value es el codigo
                      onChange={(codigoSeleccionado) => {
                        const codStr = codigoSeleccionado
                          ? String(codigoSeleccionado)
                          : "";
                        const productoAgrupado = productosMap.get(codStr);

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
                          field.form.setFieldValue("tipo", "");
                          field.form.setFieldValue("valor", 0);
                          field.form.setFieldValue("cantidad", 0);
                          field.form.setFieldValue("moneda", "");
                          field.form.setFieldValue("uuid_material", "");
                          field.form.setFieldValue("image", []);
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
                      productosMap.get(codigoActual)?.series || new Map();
                    const opcionesSeries = Array.from(
                      seriesDisponibles.keys(),
                    ).map((s) => ({
                      label: s,
                      value: s,
                    }));

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
                      productosMap.get(codigoActual)?.series.get(serieActual) ||
                      [];
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
                            placeholder="Material"
                            options={opcionesVariantes}
                            value={field.state.value || undefined}
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
                                  "tipo",
                                  seleccionado.tipo,
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
                                  "uuid_material",
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
          <Col span={24}></Col>
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
            <form.Field name="tipo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Tipo"
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
                      max={cantidadMaxDisponible}
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
            <form.Field name="uuid_material">
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


function ModalRegistrarSalidaMaterial({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateSalidaMaterial();
  const { message } = App.useApp();
  const itemModal = useToggle();
  const ModalCliente = useToggle();
  const { data: dataCliente } = useClientesListaList();
  const { data: stockData } = useCatalogoStockDetalladoMaterialList();

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
      const formData = new FormData();

      try {
        // 1. Preparamos el payload JSON (sin los bytes pesados de las imágenes)
        const jsonData: RegistrarSalidaMaterialCreateApiType = {
          ...value,
          serieNumGR: value.serieNumGR?.trim() || null,
          adicional: value.adicional?.trim() || null,
          productos: value.productos.map((p, pIdx) => {
            return {
              ...p,
              // Mapeamos las imágenes para extraerlas al FormData
              image: p.image.map((i, iIdx) => {
                if (i.image_byte) {
                  // Convertimos el base64 a Blob para enviarlo como archivo real
                  const blob = dataURLtoBlob(i.image_byte);

                  // Agregamos al FormData con un nombre identificable
                  formData.append(
                    "files",
                    blob,
                    `prod_${pIdx}_img_${iIdx}.jpg`,
                  );
                }

                // Devolvemos el objeto vacío de bytes para no inflar el JSON
                return { image_byte: "" };
              }),
            };
          }),
        };

        // 2. Empaquetamos el JSON stringificado dentro del FormData
        formData.append("data", JSON.stringify(jsonData));

        // 3. Enviamos la mutación con el FormData
        await mutateAsync(formData as any);

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
          message.error("Error inesperado al procesar la salida");
        }
      }
    },
  });

  // Dentro de ModalRegistrarSalidaMaterial
  const handleSaveProducto = (producto: ProductoType) => {
    form.setFieldValue("productos", (prev) => {
      // Usamos una copia del array actual
      const nuevaLista = [...prev];

      if (editingIndex !== null) {
        // Caso Edición: Reemplazamos en el índice específico
        nuevaLista[editingIndex] = producto;
      } else {
        // Caso Creación: Agregamos al final
        nuevaLista.push(producto);
      }
      return nuevaLista;
    });

    itemModal.setOff(); // Cerrar modal
    setEditingIndex(null); // Limpiar índice
  };

  return (
    <Modal
      title="Registro de salida de Materiales"
      style={{ margin: "auto" }}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={"90%"}
      maskClosable={false}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* SECCIÓN DATOS GENERALES */}
        <Row gutter={8}>
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
                      value={props.value === "" ? undefined : props.value}
                      maxLength={50}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={8}>
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
                      <Col span={2}>
                        {p.moneda} {p.valor}
                      </Col>
                      <Col span={2}>
                        <Row justify={"center"} gutter={2}>
                          <ButtonDelete onClick={() => field.removeValue(i)} />
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </div>

                {/* INTEGRACIÓN DEL MODAL DUAL */}
                <ModalProductoMaterial
                  open={itemModal.isToggled}
                  onClose={() => {
                    itemModal.setOff();
                    setEditingIndex(null);
                  }}
                  onSave={handleSaveProducto}
                  // Pasamos una copia fresca de los datos del Map/Array para edición

                  dataStock={stockData || []}
                  productosYaSeleccionados={
                    form.getFieldValue("productos") || []
                  }
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

export default ModalRegistrarSalidaMaterial;
