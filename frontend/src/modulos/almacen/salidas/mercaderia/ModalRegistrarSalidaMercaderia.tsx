import { useForm } from "@tanstack/react-form";
import {
  App,
  Avatar,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import z from "zod";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
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
  ruc: z.string().min(1, "Requerido").max(50, "Máximo 11 números"),
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

interface DetalleProductos {
  uuid_registro: string;
  serie: string;
  image_byte: string;
  cantidad: number;
  valor: number;
  moneda: string;
  fecha_ingreso: string;
}

interface Producto {
  codigo: string;
  name: string;
  marca: string;
  modelo: string;
  medida: string;
  dimension: string;
  categoria: string;
  variantes: DetalleProductos[];
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (producto: ProductoType) => void;
  dataStock: any[];
  productosYaSeleccionados: any[];
}

function ModalProducto({
  open,
  onClose,
  onSave,
  productosYaSeleccionados,
  dataStock,
}: ModalProps) {
  const createMercaderia = useToggle();

  const productosData = useMemo(() => {
    const map = new Map<string, Producto>();

    dataStock.forEach((item) => {
      // CALCULAR CUÁNTO SE HA USADO YA DE ESTE UUID EN EL PADRE
      const cantidadEnCarrito = productosYaSeleccionados
        .filter((p) => p.uuid_mercaderia === item.uuid_registro)
        .reduce((acc, curr) => acc + curr.cantidad, 0);

      // El stock que mostraremos será la resta
      const stockDisponible = item.stock_actual - cantidadEnCarrito;

      if (!map.has(item.codigo)) {
        map.set(item.codigo, {
          codigo: item.codigo,
          name: item.name,
          marca: item.marca,
          modelo: item.modelo,
          medida: item.medida,
          dimension: item.dimension,
          categoria: item.categoria,
          variantes: [],
        });
      }
      if (stockDisponible > 0) {
        map.get(item.codigo)!.variantes.push({
          uuid_registro: item.uuid_registro,
          serie: item.serie,
          image_byte: item.image_byte,
          cantidad: stockDisponible, // <-- Stock real para este modal
          valor: item.valor,
          moneda: item.moneda,
          fecha_ingreso: ""
        });
      }
    });
    return map;
  }, [dataStock, productosYaSeleccionados]);

  const opcionesAutocomplete = useMemo(
    () =>
      Array.from(productosData.entries()).map(([codigo, data], index) => ({
        label: `${index + 1}. ${codigo} | ${data.name}`,
        value: codigo,
      })),
    [productosData],
  );

  const form = useForm({
    defaultValues: {
      // Valores base por defecto
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
      seleccionadas: {} as Record<string, number>,
    },
    onSubmit: async ({ value }) => {
      const seleccionadas = value.seleccionadas || {};

      const dataParaGuardar = Object.entries(seleccionadas)
        .filter(([_, cant]) => (cant as number) > 0)
        .map(([keyConIndice, cant]) => {
          // Extraemos el UUID real (lo que está antes del último "_")
          const parts = keyConIndice.split("_");
          parts.pop(); // Quitamos el índice
          const uuidReal = parts.join("_");

          const producto = productosData.get(value.codigo);
          const variante = producto?.variantes.find(
            (v) => v.uuid_registro === uuidReal,
          );

          return {
            // Datos del producto padre
            codigo: value.codigo,
            name: value.name,
            marca: value.marca,
            modelo: value.modelo,
            // Datos de la variante específica
            ...variante,
            cantidad_seleccionada: cant,
          };
        });

      if (dataParaGuardar.length === 0) {
        // Podrías mostrar un mensaje: "Debe seleccionar al menos una serie"
        return;
      }

      dataParaGuardar.forEach((item) => {
        // 1. Preparamos la imagen correctamente
        // Si item.image_byte ya es el base64, lo envolvemos en el formato que espera tu lista
        const imagenFormateada = item.image_byte
          ? [{ image_byte: getBase64WithPrefix(item.image_byte) }]
          : [];

        onSave({
          n_serie: item.serie || "", // Usamos la serie del item actual
          uuid_mercaderia: item.uuid_registro || "", // Usamos el UUID del item actual
          codigo: value.codigo,
          name: value.name,
          marca: value.marca,
          modelo: value.modelo,
          medida: value.medida,
          dimension: value.dimension,
          categoria: value.categoria,
          serie: item.serie || "",
          cantidad: item.cantidad_seleccionada,
          valor: item.valor || 0,
          moneda: item.moneda || "",
          image: imagenFormateada, // Enviamos el array con el formato correcto
        });
      });

      form.reset(); // Limpia el formulario para la próxima vez
      onClose();
    },
  });

  return (
    <Modal
      title={<Text>{"Salida de Mercadería"}</Text>}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "80%" }}
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
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* COLUMNA IZQUIERDA: Identificación y Detalles */}
          <div className="p-4 border rounded-md">
            <div className="">
              <div className="font-semibold">Identificación del Producto:</div>
              <form.Field name="codigo">
                {(field) => (
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Buscar por código o nombre:</Text>
                    <InputSearch
                      options={opcionesAutocomplete}
                      value={field.state.value}
                      placeholder="Escriba aquí..."
                      onChange={(codigo) => {
                        const val = codigo as string;
                        field.handleChange(val);

                        const producto = productosData.get(val);
                        if (producto && producto.variantes.length > 0) {
                          const seleccionado = producto.variantes[0];
                          // Usamos validate: false para evitar el error 'onServer' al actualizar masivamente

                          form.setFieldValue("name", producto.name);
                          form.setFieldValue("marca", producto.marca);
                          form.setFieldValue("modelo", producto.modelo);
                          form.setFieldValue("medida", producto.medida);
                          form.setFieldValue("dimension", producto.dimension);
                          form.setFieldValue("categoria", producto.categoria);
                          form.setFieldValue("valor", seleccionado.valor);
                          form.setFieldValue("moneda", seleccionado.moneda);
                          form.setFieldValue(
                            "uuid_mercaderia",
                            seleccionado.uuid_registro,
                          );
                          form.setFieldValue("serie", seleccionado.serie);

                          const imageVal = seleccionado.image_byte
                            ? [
                                {
                                  image_byte: getBase64WithPrefix(
                                    seleccionado.image_byte,
                                  ),
                                },
                              ]
                            : [];
                          form.setFieldValue("image", imageVal);
                        }
                      }}
                    />
                  </div>
                )}
              </form.Field>

              {/* SECCIÓN DE DETALLES TÉCNICOS */}
              <form.Subscribe
                selector={(s) => [
                  s.values.name,
                  s.values.marca,
                  s.values.modelo,
                  s.values.medida,
                  s.values.dimension,
                  s.values.categoria,
                ]}
              >
                {([name, marca, modelo, medida, dimension, categoria]) => {
                  if (!name) return null; // No mostrar nada si no hay producto seleccionado

                  return (
                    <div
                      
                      className="mt-4 p-3 border rounded shadow"
                    >
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: 8,
                          color: "#1890ff",
                        }}
                      >
                        {name.toUpperCase()}
                      </Text>
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Text type="secondary">Marca:</Text> <br />
                          <Text>{marca || "-"}</Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Modelo:</Text> <br />
                          <Text>{modelo || "-"}</Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Categoría:</Text> <br />
                          <Tag color="orange">{categoria || "General"}</Tag>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Medida:</Text> <br />
                          <Text>
                            {medida} {dimension ? `(${dimension})` : ""}
                          </Text>
                        </Col>
                      </Row>
                    </div>
                  );
                }}
              </form.Subscribe>
            </div>
          </div>

          {/* COLUMNA DERECHA: Visualización de Stock con Selección Múltiple */}
          <div>
            <div className="flex flex-col gap-2 border rounded-md p-4">
              <h1 className="font-semibold">Series y Stock Disponible:</h1>
              <form.Subscribe selector={(state) => state.values.codigo}>
                {(codigo) => {
                  const producto = productosData.get(codigo as string);
                  if (!producto)
                    return <Empty description="Busque un producto" />;

                  return (
                    <div
                      className="p-3 border rounded shadow overflow-auto scroll-auto max-h-60 flex flex-col gap-2"
                    >
                      {producto.variantes.map((v, index) => {
                        // Generamos un identificador único para el estado del formulario
                        const fieldName =
                          `seleccionadas.${v.uuid_registro}_${index}` as any;

                        return (
                          <div
                            key={`${v.uuid_registro}-${index}`}
                            className="p-3 rounded shadow bg-mist-200 hover:border hover:border-mist-400"
                          >
                            <form.Field name={fieldName}>
                              {(field) => {
                                const cantidadActual = field.state.value || 0;
                                const isChecked = cantidadActual > 0;

                                return (
                                  <Row align="middle" gutter={[12, 12]}>
                                    {/* CHECKBOX: Controla si la cantidad es > 0 */}
                                    <Col span={2}>
                                      <Checkbox
                                        checked={isChecked}
                                        onChange={(e) => {
                                          // Si marca, ponemos 1 (o puedes poner v.cantidad si prefieres todo el stock)
                                          // Si desmarca, ponemos 0
                                          field.handleChange(
                                            (e.target.checked ? 1 : 0) as any,
                                          );
                                        }}
                                      />
                                    </Col>

                                    {/* INFO DE LA SERIE */}
                                    <Col span={16}>
                                      <Flex gap={12} align="center">
                                        <Avatar
                                          shape="square"
                                          size={45}
                                          src={
                                            v.image_byte
                                              ? getBase64WithPrefix(
                                                  v.image_byte,
                                                )
                                              : undefined
                                          }
                                        />
                                        <div className="flex flex-col gap-2">
                                          <h1
                                            className="font-semibold text-xs dark:text-mist-900"
                                          >
                                            S/N: {v.serie}
                                          </h1>
                                          <div className="flex flex-row gap-2">
                                            <Tag color="blue">
                                            Disp: {v.cantidad}
                                          </Tag>
                                          <Tag color="green">
                                            {v.moneda} {v.valor}
                                          </Tag>
                                          </div>
                                        </div>
                                      </Flex>
                                    </Col>

                                    {/* INPUT DE CANTIDAD */}
                                    <Col span={6}>
                                      <div style={{ textAlign: "right"}}>
                                        <InputNumber
                                          min={0}
                                          max={v.cantidad}
                                          value={cantidadActual}
                                          disabled={!isChecked} // Deshabilitado si el checkbox no está marcado
                                          onChange={(val) =>
                                            field.handleChange(
                                              (val || 0) as any,
                                            )
                                          }
                                          status={
                                            cantidadActual > v.cantidad
                                              ? "error"
                                              : ""
                                          }
                                          style={{ width: "100%" }}
                                          placeholder="Cant."
                                        />
                                        {cantidadActual > v.cantidad && (
                                          <Text
                                            type="danger"
                                            style={{ fontSize: "10px" }}
                                          >
                                            Excede stock
                                          </Text>
                                        )}
                                      </div>
                                    </Col>
                                  </Row>
                                );
                              }}
                            </form.Field>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              </form.Subscribe>
            </div>
          </div>
        </div>

        <Flex justify="end" style={{ marginTop: 24 }}>
          <form.Subscribe
            selector={(s) => [s.isValid, s.isDirty, s.isSubmitting]}
          >
            {([isValid, isDirty, isSubmitting]) => (
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isValid || !isDirty}
                loading={isSubmitting}
              >
                Agregar a la lista
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
  const { data: stockData } =
    useCatalogoStockDetalladoMercaderiaList();

  const opciones = useMemo(() => {
    return (
      dataCliente?.map((c) => ({
        value: c.cliente,
        label: c.cliente,
      })) ?? []
    );
  }, [dataCliente]);

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
    const jsonData: RegistrarSalidaMercaderiaCreateApiType = {
      ...value,
      serieNumGR: value.serieNumGR?.trim().toUpperCase() || null,
      adicional: value.adicional?.trim() || null,
      productos: value.productos.map((p, pIdx) => {
        return {
          ...p,
          // Mapeamos las series/productos para extraer las imágenes al FormData
          image: p.image.map((i, iIdx) => {
            if (i.image_byte) {
              // Convertimos el base64 a Blob para enviarlo como archivo real
              const blob = dataURLtoBlob(i.image_byte);
              // Nombre único para identificarlo en el backend si es necesario
              formData.append("files", blob, `prod_${pIdx}_img_${iIdx}.jpg`);
            }
            
            // Devolvemos el objeto de imagen vacío de bytes para el JSON
            // Esto mantiene la estructura que espera tu Tipo/Zod sin saturar el payload
            return { image_byte: "" }; 
          }),
        };
      }),
    };

    // 2. Empaquetamos todo en el FormData
    formData.append("data", JSON.stringify(jsonData));

    // 3. Enviamos la mutación (asegúrate que el backend espere multipart/form-data)
    await mutateAsync(formData as any);

    message.success("Registro exitoso");
    formApi.reset();
    itemModal.setOff();
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
                          <ButtonDelete onClick={() => field.removeValue(i)} />
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </div>

                {/* INTEGRACIÓN DEL MODAL DUAL */}
                <ModalProducto
                  open={itemModal.isToggled}
                  dataStock={stockData || []}
                  productosYaSeleccionados={field.state.value}
                  onClose={() => {
                    itemModal.setOff();
                  }}
                  onSave={(nuevoProd) => {
                    field.pushValue(nuevoProd);
                    itemModal.setOff();
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
