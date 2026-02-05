import { useForm } from "@tanstack/react-form";
import { App, Button, Checkbox, Col, Flex, Input, Modal, Row } from "antd";
import z from "zod";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import type { ClientesListaCreateApiType } from "../../../../api/queries/modulos/administracion/lista/clientes/clientesLista.api.schema";
import { useState } from "react";
import { useCreateClientesLista } from "../../../../api/queries/modulos/administracion/lista/clientes/clientesLista.api";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";

export const ClientesListaCreateUISchema = z.object({
  ruc: z.string().min(3, "Requerido"),
  cliente: z.string().min(3, "Requerido"),
  dfiscal: z.string(),
  contacto1: z.string(),
  contacto2: z.string(),
  contacto3: z.string(),
  contacto4: z.string(),
  contacto5: z.string(),
  otro1: z.string(),
  otro2: z.string(),
  otro3: z.string(),
  otro4: z.string(),
  otro5: z.string(),
});

type isUsuarioField = keyof typeof ClientesListaCreateUISchema.shape;
const uiFields = Object.keys(
  ClientesListaCreateUISchema.shape,
) as isUsuarioField[];

const isUsuarioField = (field: string): field is isUsuarioField => {
  return uiFields.includes(field as isUsuarioField);
};

function ModalCreateClientesLista({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expansible, setExpansible] = useState(false);
  const { mutateAsync } = useCreateClientesLista();
  const { message } = App.useApp();

  const form = useForm({
    defaultValues: {
      ruc: "",
      cliente: "",
      dfiscal: "",
      contacto1: "",
      contacto2: "",
      contacto3: "",
      contacto4: "",
      contacto5: "",
      otro1: "",
      otro2: "",
      otro3: "",
      otro4: "",
      otro5: "",
    },
    validators: {
      onSubmit: ClientesListaCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ClientesListaCreateApiType = {
          ruc: value.ruc.trim(),
          cliente: value.cliente.trim(),
          dfiscal: value.dfiscal.trim() || null,
          contacto1: value.contacto1.trim() || null,
          contacto2: value.contacto2.trim() || null,
          contacto3: value.contacto3.trim() || null,
          contacto4: value.contacto4.trim() || null,
          contacto5: value.contacto5.trim() || null,
          otro1: value.otro1.trim() || null,
          otro2: value.otro2.trim() || null,
          otro3: value.otro3.trim() || null,
          otro4: value.otro4.trim() || null,
          otro5: value.otro5.trim() || null,
        };
        await mutateAsync(payload);
        message.success("Registro exitoso");
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
      title="Crear Cliente"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
      maskClosable={false}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Row gutter={8}>
          <Col xs={24} lg={8}>
            <form.Field name="ruc">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="RUC"
                      allowClear
                      maxLength={11}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col xs={24} lg={16}>
            <form.Field name="cliente">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Razon Social de Cliente"
                      allowClear
                      maxLength={400}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Col span={24}>
            <form.Field name="dfiscal">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Dirección Fiscal"
                      allowClear
                      maxLength={400}
                    />
                  )}
                </FieldWrapper>
              )}
            </form.Field>
          </Col>
          <Flex
            justify="start"
            align="start"
            vertical
            style={{ width: "100%" }}
          >
            <Checkbox onChange={() => setExpansible(!expansible)}>
              Agregar información adicional
            </Checkbox>
            <div
              style={{
                display: expansible ? "block" : "none",
                marginTop: 16,
                width: "100%",
              }}
            >
              <Row gutter={8}>
                <Col span={12}>
                  <form.Field name="contacto1">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Contacto 1"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="contacto2">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Contacto 2"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="contacto3">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Contacto 3"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="contacto4">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Contacto 4"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="contacto5">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Contacto 5"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="otro1">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Adicional 1"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="otro2">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Adicional 2"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="otro3">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Adicional 3"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="otro4">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Adicional 4"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
                <Col span={12}>
                  <form.Field name="otro5">
                    {(field) => (
                      <FieldWrapper field={field}>
                        {(props) => (
                          <Input
                            {...props}
                            placeholder="Adicional 5"
                            allowClear
                            maxLength={400}
                          />
                        )}
                      </FieldWrapper>
                    )}
                  </form.Field>
                </Col>
              </Row>
            </div>
          </Flex>
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

export default ModalCreateClientesLista;
