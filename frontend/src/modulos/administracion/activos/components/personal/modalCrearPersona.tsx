import { useForm } from "@tanstack/react-form";
import { Col, Modal, Row } from "antd";
import { PersonalActivosCrearUI } from "../../api/personal/personal.schema";
import { FieldWrapper } from "../../../../../helpers/FieldWrapperForm";
import { NumericInput } from "../../../../../components/molecules/input/InputNumero";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
}

export function ModalCrearPersonalActivo({ open, onClose }: Props) {
  const form = useForm({
    defaultValues: {
      dni: "",
      nombre: "",
      cargo: "",
      fecha_ingreso: "",
      rem_basico: 0,
      asig_familiar: 0,
      grati: 0,
      cts: 0,
      vacacion: 0,
    },
    validators: {
      onSubmit: PersonalActivosCrearUI,
    },
    onSubmit: (data) => {
      console.log(data);
    },
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
    >
      <div className="">
        <h1>Crear Personal</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <form.Field name="dni">
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
              <form.Field name="dni">
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
          </Row>
        </form>
      </div>
    </Modal>
  );
}

export function ModalEditarPersonalActivo({ id, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
    >
      <div>{"el id es: " + id}</div>
    </Modal>
  );
}
