import { useForm } from "@tanstack/react-form";
import { App, Button, Col, Flex, Input, InputNumber, Modal, Row } from "antd";
import z from "zod";
import type { CatalogoMercaderiaCreateApiType } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api.schema";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import FormUploadImage from "../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import { useCreateCatalogoMercaderia } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api";
import TextArea from "antd/es/input/TextArea";

const CatalogoMercaderiaCreateUISchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  medida: z.string().min(1, "La medida es requerida"),
  categoria: z.string().min(1, "La categoría es requerida"),
  plimit: z.number().min(1, "Límite 1 es requerido"),
  dimension: z.string(),
  descripcion: z.string(),
  imagen: z
    .array(
      z.object({
        image_byte: z
          .string()
          .startsWith("data:image/", "Formato de imagen inválido"),
      }),
    )
    .min(1, "Debe existir al menos una imagen de 4 posibles"),
});

type UsuarioField = keyof typeof CatalogoMercaderiaCreateUISchema.shape;
const uiFields = Object.keys(
  CatalogoMercaderiaCreateUISchema.shape,
) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};

function CatalogoMercaderiaCreate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync } = useCreateCatalogoMercaderia();
  const { message } = App.useApp();

  const optionsMedida = [
    {
      value: "UNIDAD",
      label: "Unidad",
    },
    {
      value: "METRO",
      label: "Metro",
    },
    {
      value: "PAR",
      label: "Par",
    },
  ];

  const optionsCategoria = [
    {
      value: "ESTACIÓN METEOROLÓGICA",
      label: "Estación Meteorológica",
    },
    {
      value: "SISTEMAS CCTV",
      label: "Sistemas CCTV",
    },
    {
      value: "REDES E INTERNET",
      label: "Redes e Internet",
    },
    {
      value: "RADIO-ENLACE",
      label: "Radio-Enlace",
    },
    {
      value: "RADIO-COMUNICACIÓN",
      label: "Radio-Comunicación",
    },
    {
      value: "SISTEMA PV",
      label: "Sistema PV",
    },
    {
      value: "TORRES",
      label: "Torres",
    },
  ];

  const form = useForm({
    defaultValues: {
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      categoria: "",
      plimit: undefined as number | undefined,
      descripcion: "",
      dimension: "",
      imagen: [] as { image_byte: string }[],
    },
    validators: {
      onSubmit: CatalogoMercaderiaCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CatalogoMercaderiaCreateApiType = {
          codigo: value.codigo.trim().toUpperCase(),
          name: value.name.trim(),
          marca: value.marca.trim(),
          modelo: value.modelo.trim(),
          medida: value.medida.trim(),
          categoria: value.categoria,
          plimit: value.plimit ?? 1,
          dimension: value.dimension.trim() || null,
          descripcion: value.descripcion.trim() || null,
          imagen1: value.imagen[0]?.image_byte ?? null,
          imagen2: value.imagen[1]?.image_byte ?? null,
          imagen3: value.imagen[2]?.image_byte ?? null,
          imagen4: value.imagen[3]?.image_byte ?? null,
        };

        await mutateAsync(payload);
        message.success("Registro creado correctamente");
        formApi.reset();
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

  return (
    <Modal
      title="Crear Mercadería"
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "60%" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Row>
          <Col span={24}>
            <form.Field name="imagen">
              {(field) => (
                <Flex justify="center" align="center">
                  <FieldWrapper field={field}>
                    {(props) => (
                    <Flex justify="center" align="center">
                      <FormUploadImage {...props} field={field} maxFiles={4} />
                    </Flex>
                    )}
                  </FieldWrapper>
                </Flex>
              )}
            </form.Field>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="codigo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Código" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="name">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Nombre" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="marca">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Marca" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="modelo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Modelo" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="medida">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      placeholder="Medida"
                      options={optionsMedida}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="dimension">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Dimensión" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="categoria">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      placeholder="Categoría"
                      options={optionsCategoria}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="plimit">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <InputNumber
                      {...props}
                      placeholder="Cantidad mínima en stock"
                      min={1}
                      style={{width: '100%'}}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col span={24}>
            <form.Field name="descripcion">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <TextArea {...props} placeholder="Descripción" allowClear />
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

export default CatalogoMercaderiaCreate;
