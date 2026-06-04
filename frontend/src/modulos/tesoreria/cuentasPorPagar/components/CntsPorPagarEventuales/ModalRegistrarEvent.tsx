import { type CuentasPorPagarEventualRegistrarApiType } from "../../data/api.shemaCuentasPorCobar";
import { useCuentasPorPagarEventualCreate } from "../../data/api.cuentasPorPagar";
import { App, Modal } from "antd";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { ApiError } from "../../../../../api/normalizeError";
import { setFormErrors } from "../../../../../helpers/formHelpers";
import { FormOptsCntsPorPagarEventual, isUsuarioFieldCuentasPorPagarEventual } from "./StructureFormDataCntPagarEvent";
import { FromCntsPorPagarEventual } from "./ComposeUICntPagarEvent";
import { useAppForm } from "../../../../../components/tanstackform/components/core/form";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FormNuevaObligacionEventual({ open, onClose}: Props) {
  const { mutateAsync, isPending } = useCuentasPorPagarEventualCreate();
  const { message } = App.useApp();

  const form = useAppForm({
    ...FormOptsCntsPorPagarEventual,
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CuentasPorPagarEventualRegistrarApiType = {
          empresa: value.empresa.trim().toUpperCase(),
          detalle: value.detalle.trim().toUpperCase(),
          monto_esperado: value.monto_esperado,
          moneda: value.moneda,
          fecha_emision: format(value.fecha_emision, "yyyy-MM-dd"),
          fecha_vencimiento: format(value.fecha_vencimiento, "yyyy-MM-dd"),
        };
        await mutateAsync(payload);
        message.success("Registrado exitosamente");
        formApi.reset();
        onClose();
      } catch (err) {

        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioFieldCuentasPorPagarEventual);

          if (err.kind !== "validation") {
            message.error(err.message);
          }
        } else {
          message.error("Error inesperado. Intente de nuevo.");
          console.error("Form Error:", err);
        }
      }
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
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-mist-100 flex items-center gap-2">
            <span className="bg-teal-600 text-white p-1.5 rounded-lg text-sm font-black">
              <FaPlus className="animate-bounce" />
            </span>
            Nueva Obligación Fija
          </h3>
          <FromCntsPorPagarEventual form={form} />
          <form.AppForm>
            <div className="flex justify-end mt-4">
              <form.SubscribeButton label="Registrar" isPending={isPending} />
            </div>
          </form.AppForm>
        </div>
      </form>
    </Modal>
  );
}
