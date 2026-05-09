import { Modal } from "antd";
import { PersonalActivosCrearUI } from "../../api/personal/personal.schema";
import { useAppForm } from "../UI/inputs/form/form";
import { dataActivosPersonal } from "../../api/personal/data";
import { FormPersonalFields } from "./composeFormUiPersonal";
interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
}

export function ModalEditarPersonalActivo({ id, open, onClose }: Props) {
  const data = dataActivosPersonal.find((item) => item.id === id);

  const form = useAppForm({
    defaultValues: {
      dni: data?.dni ?? "",
      nombre: data?.nombre ?? "",
      cargo: data?.cargo ?? "",
      fecha_ingreso: data?.fecha_ingreso ?? "",
      rem_basico: data?.rem_basico ?? 0,
      asig_familiar: data?.asig_familiar ?? 0,
      grati: data?.grati ?? 0,
      cts: data?.cts ?? 0,
      vacacion: data?.vacacion ?? 0,
    },
    validators: {
      onSubmit: PersonalActivosCrearUI,
    },
    onSubmit: ({ value }) => {
      alert(JSON.stringify(value, null, 2));
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-bold  text-shadow-2xs">
            Actualizar registro de personal
          </h1>
          <FormPersonalFields form={form} />
          <form.AppForm>
            <div className="flex justify-end">
              <form.SubscribeButton label="Actualizar" />
            </div>
          </form.AppForm>
        </div>
      </form>
    </Modal>
  );
}
