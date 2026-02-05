import { useForm } from "@tanstack/react-form";
import {
  App,
  Button,
  Col,
  DatePicker,
  Flex,
  Input,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import z from "zod";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import type {
  ChipCreateType,
  ChipOutType,
  ChipUpdateType,
} from "../../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateChip } from "../../../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import { ApiError } from "../../../../../api/normalizeError";
import { NumericInput } from "../../../../../components/molecules/input/InputNumero";
import getBase64WithPrefix from "../../../../../helpers/ImagesBase64";
import { FieldWrapper } from "../../../../../helpers/FieldWrapperForm";
import FormUploadImage from "../../../../../components/molecules/upload/UploadImage";
import { setFormErrors } from "../../../../../helpers/formHelpers";
import { defaultImage } from "../../../../../assets/images";

const { Title } = Typography;

const ChipUpdateUISchema = z.object({
  numero: z.string().min(9, "Mínimo 9 dígitos"),
  iccid: z.string().min(19, "Requiere minimo 19 caracteres"),
  operador: z.string().min(3, "Requiere minimo 3 caracteres"),
  mb: z.string().min(1, "Requiere minimo 1 caracter"),
  activacion: z.iso.datetime().or(z.literal("")),
  instalacion: z.iso.datetime().or(z.literal("")),
  adicional: z.string().or(z.literal("")),
  status: z.number().int().min(0).max(2),
  image_byte: z
    .array(
      z.object({
        image_byte: z
          .string()
          .regex(
            /^data:image\/(jpeg|jpg|png);base64,/,
            "Solo se permiten imágen JPG, JPEG o PNG",
          ),
      }),
    )
    .min(1, "Debe existir al menos una imagen"),
});

type ChipField = keyof ChipCreateType;
const uiFields = Object.keys(ChipUpdateUISchema.shape) as ChipField[];

function isUsuarioField(field: string): field is ChipField {
  return uiFields.includes(field as ChipField);
}

export function useChipsFromCache(id: number | null): ChipOutType | undefined {
  const qc = useQueryClient();
  const pro = qc.getQueryData<ChipOutType[]>(["chips"]);
  return pro?.find((u) => u.id === id);
}

function ModalChipsUpdate({
  id,
  open,
  onClose,
}: {
  id: number;
  open: boolean;
  onClose: () => void;
}) {
  const pro = useChipsFromCache(id);
  const { mutateAsync } = useUpdateChip(id);
  const { message } = App.useApp();

  const ImagenTotal=[
    pro?.imagen1 || "",
    pro?.imagen2 || "",
  ].filter(Boolean) as string[];

  const form = useForm({
    defaultValues: {
      numero: pro?.numero.toString() ?? "",
      iccid: pro?.iccid ?? "",
      operador: pro?.operador ?? "",
      mb: pro?.mb ?? "",
      activacion: pro?.activacion ?? "",
      instalacion: pro?.instalacion ?? "",
      adicional: pro?.adicional ?? "",
      status: pro?.status ?? -1,
      image_byte: ImagenTotal.map((img) => ({
        image_byte: img ? getBase64WithPrefix(img) : defaultImage,
      })) || [],
    },
    validators: {
      onSubmit: ChipUpdateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ChipUpdateType = {
          ...value,
          numero: Number(value.numero),
          activacion: value.activacion || undefined,
          instalacion: value.instalacion || undefined,
          adicional: value.adicional || undefined,
          status: Number(value.status),
          imagen1: value.image_byte[0]?.image_byte ?? null,
          imagen2: value.image_byte[1]?.image_byte ?? null,
        };
        console.log(payload);
        await mutateAsync(payload);
        message.success("Cliente actualizado correctamente");
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
      title={<Title level={4}>Actualizar chip</Title>}
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
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <form.Field name="numero">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <NumericInput
                      {...props}
                      placeholder="Ingrese número"
                      value={field.state.value ?? ""}
                      minLength={9}
                      maxLength={11}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="iccid">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Ingrese iccid" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="operador">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Operador" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="mb">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input {...props} placeholder="Plan MB" allowClear />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={8}>
              <Col span={12}>
                <form.Field name="activacion">
                  {(field) => (
                    <FieldWrapper field={field}>
                      {(props) => (
                        <DatePicker
                          {...props}
                          placeholder="Fecha de activación"
                          format="DD/MM/YYYY"
                          value={
                            field.state.value ? dayjs(field.state.value) : null
                          }
                          onChange={(d) =>
                            field.handleChange(d ? d.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FieldWrapper>
                  )}
                </form.Field>
              </Col>

              <Col span={12}>
                <form.Field name="instalacion">
                  {(field) => (
                    <FieldWrapper field={field}>
                      {(props) => (
                        <DatePicker
                          {...props}
                          placeholder="Fecha de instalación"
                          format="DD/MM/YYYY"
                          value={
                            field.state.value ? dayjs(field.state.value) : null
                          }
                          onChange={(d) =>
                            field.handleChange(d ? d.toISOString() : "")
                          }
                          onBlur={field.handleBlur}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FieldWrapper>
                  )}
                </form.Field>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={12}>
            <form.Field name="adicional">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <TextArea
                      {...props}
                      placeholder="Información adicional"
                      rows={2}
                      maxLength={255}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="image_byte">
              {(field) => (
                <Flex justify="center" align="center">
                  <FieldWrapper field={field}>
                    {(props) => (
                      <Flex justify="center" align="center">
                        <FormUploadImage
                          {...props}
                          field={field}
                          maxFiles={2}
                        />
                      </Flex>
                    )}
                  </FieldWrapper>
                </Flex>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={12}>
            <form.Field name="status">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <fieldset className="border-2 border-slate-600 p-3 rounded-xs">
                      <legend className="px-3">Estado:</legend>
                      <Radio.Group
                        {...props}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        options={[
                          { value: 0, label: "Stock" },
                          { value: 1, label: "Activo" },
                          { value: 2, label: "Baja" },
                        ]}
                      />
                    </fieldset>
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
        </Row>

        <Flex justify="end">
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
                Actualizar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Modal>
  );
}

export default ModalChipsUpdate;
