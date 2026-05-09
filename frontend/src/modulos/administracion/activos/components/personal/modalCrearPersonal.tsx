import { Modal } from "antd";
import { FormPersonalFields } from "./composeFormUiPersonal";
import { FormOpts } from "./structureCrearPersonal";
import { useAppForm } from "../UI/inputs/form/form";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
}

export function ModalCrearPersonalActivo({ open, onClose }: Props) {
  const form = useAppForm({
    ...FormOpts,
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
            Registrar nuevo personal
          </h1>
          <FormPersonalFields form={form} />
          <form.AppForm>
            <div className="flex justify-end">
              <form.SubscribeButton label="Registrar" />
            </div>
          </form.AppForm>
        </div>
      </form>
    </Modal>
  );
}

