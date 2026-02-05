import { useForm } from "@tanstack/react-form";
import { App, Button, Checkbox, Col, Flex, Input, Modal, Row } from "antd";
import z from "zod";
import { FieldWrapper } from "../../../../helpers/FieldWrapperForm";
import { useState } from "react";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { useQueryClient } from "@tanstack/react-query";
import type { ProveedoresListaOutApiType, ProveedoresListaUpdateApiType } from "../../../../api/queries/modulos/administracion/lista/proveedores/provedoresLista.api.schema";
import { useUpdateProveedoresLista } from "../../../../api/queries/modulos/administracion/lista/proveedores/proveedoresLista.api";

export const ProveedoresListaCreateUISchema = z.object({
  ruc: z.string().min(3, "Requerido"),
  proveedor: z.string().min(3, "Requerido"),
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

type isUsuarioField = keyof typeof ProveedoresListaCreateUISchema.shape;
const uiFields = Object.keys(
  ProveedoresListaCreateUISchema.shape,
) as isUsuarioField[];

const isUsuarioField = (field: string): field is isUsuarioField => {
  return uiFields.includes(field as isUsuarioField);
};

function useProveedoresListaFromCache(id: number): ProveedoresListaOutApiType | undefined {
    const qc = useQueryClient();
    const proveedor = qc.getQueryData<ProveedoresListaOutApiType[]> (["proveedoresLista"])
    return proveedor?.find((proveedor) => proveedor.id === id);
}


function ModalUpdateProveedoresLista({
    id,
  open,
  onClose,
}: {
    id: number;
  open: boolean;
  onClose: () => void;
}) {
  const [expansible, setExpansible] = useState(false);
  const { message } = App.useApp();
  const proveedor = useProveedoresListaFromCache(id);
const { mutateAsync} = useUpdateProveedoresLista(id);


  const form = useForm({
    defaultValues: {
      ruc: proveedor?.ruc || "",
      proveedor: proveedor?.proveedor || "",
      dfiscal: proveedor?.dfiscal || "",
      contacto1: proveedor?.contacto1 || "",
      contacto2: proveedor?.contacto2 || "",
      contacto3: proveedor?.contacto3 || "",
      contacto4: proveedor?.contacto4 || "",
      contacto5: proveedor?.contacto5 || "",
      otro1: proveedor?.otro1 || "",
      otro2: proveedor?.otro2 || "",
      otro3: proveedor?.otro3 || "",
      otro4: proveedor?.otro4 || "",
      otro5: proveedor?.otro5 || "",
    },
    validators: {
      onSubmit: ProveedoresListaCreateUISchema,
    },

    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: ProveedoresListaUpdateApiType = {
          ruc: value.ruc.trim(),
          proveedor: value.proveedor.trim(),
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
        message.success("Actualización exitosa");
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
      title="Actualizar información del proveedor"
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
            <form.Field name="proveedor">
              {(field) => (
                <FieldWrapper field={field}>
                  {(props) => (
                    <Input
                      {...props}
                      placeholder="Razon Social de proveedor"
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
              Actualizar información adicional
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
                Actualizar
              </Button>
            )}
          </form.Subscribe>
        </Flex>
      </form>
    </Modal>
  );
}

export default ModalUpdateProveedoresLista;
