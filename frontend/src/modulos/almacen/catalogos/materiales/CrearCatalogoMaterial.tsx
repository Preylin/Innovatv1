import { useForm } from "@tanstack/react-form";
import { App, Button, Col, Flex, Form, Input, InputNumber, Modal, Row } from "antd";
import z from "zod";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import FormUploadImage from "../../../../components/molecules/upload/UploadImage";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import FormSelectCreatable from "../../../../components/molecules/select/SelectAddItem";
import { useCreateCatalogoMaterial } from "../../../../api/queries/modulos/almacen/catalogos/materiales/material.api";
import type { CatalogoMaterialCreateApiType } from "../../../../api/queries/modulos/almacen/catalogos/materiales/material.api.schema";
import TextArea from "antd/es/input/TextArea";


const CatalogoMaterialesCreateUISchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  medida: z.string().min(1, "La medida es requerida"),
  tipo: z.string().min(1, "La categoría es requerida"),
  plimit: z.number().min(1, "Requerido"),
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

type UsuarioField = keyof typeof CatalogoMaterialesCreateUISchema.shape;
const uiFields = Object.keys(
  CatalogoMaterialesCreateUISchema.shape,
) as UsuarioField[];

const isUsuarioField = (field: string): field is UsuarioField => {
  return uiFields.includes(field as UsuarioField);
};

function CatalogoMaterialesCreate(
  { open, onClose }: { open: boolean; onClose: () => void}
) {
  const { mutateAsync } = useCreateCatalogoMaterial();
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

  const optionstipo = [
    {
      value: "CABLES",
      label: "Cables",
    },
    {
      value: "TUBERIAS",
      label: "Tuberías",
    },
    {
      value: "TABLEROS",
      label: "Tableros",
    },
    {
      value: "BATERIAS",
      label: "Baterías",
    },
    {
      value: "PERNOS",
      label: "Pernos",
    },
  ];

  const form = useForm({
    defaultValues: {
      codigo: "",
      name: "",
      marca: "",
      modelo: "",
      medida: "",
      tipo: "",
      plimit: undefined as number | undefined,
      descripcion: "",
      dimension: "",
      imagen: [] as { image_byte: string }[],
    },
    validators: {
      onSubmit: CatalogoMaterialesCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CatalogoMaterialCreateApiType = {
          codigo: value.codigo.trim().toUpperCase(),
          name: value.name.trim(),
          marca: value.marca.trim(),
          modelo: value.modelo.trim(),
          medida: value.medida.trim(),
          tipo: value.tipo,
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
    title= "Crear Material"
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
                  <Form.Item
                    validateStatus={
                      field.state.meta.errors.length ? "error" : ""
                    }
                    help={field.state.meta.errors[0]?.message}
                  >
                    <Flex justify="center" align="center">
                      <FormUploadImage field={field} maxFiles={4} />
                    </Flex>
                  </Form.Item>
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
            <form.Field name="tipo">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <FormSelectCreatable
                      {...props}
                      placeholder="Categoría"
                      options={optionstipo}
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

export default CatalogoMaterialesCreate;
