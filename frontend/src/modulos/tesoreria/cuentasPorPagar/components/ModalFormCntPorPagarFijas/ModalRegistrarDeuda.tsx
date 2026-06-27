import { type CuentasPorPagarCreateApiType } from "../../data/api.shemaCuentasPorCobar";
import { useCreateObligacionPagar } from "../../data/api.cuentasPorPagar";
import { App, Modal } from "antd";
import { useAppForm } from "../formulario/components/core/form";
import {
  FormOptsCntsPorPagarFijas,
  isUsuarioFieldCuentasPorPagarFijas,
} from "./StructureFormDataCntPagarFijas";
import { FromCntsPorPabarFijas } from "./ComposeUICntPagarFijas";
import { FaPlus } from "react-icons/fa";
import { ApiError } from "../../../../../api/normalizeError";
import { setFormErrors } from "../../../../../helpers/formHelpers";

interface Props {
  open: boolean;
  onClose: () => void;
  mesActual: string;
}

export function FormNuevaObligacion({ open, onClose, mesActual }: Props) {
  const { mutateAsync, isPending } = useCreateObligacionPagar(mesActual);
  const { message } = App.useApp();

  const form = useAppForm({
    ...FormOptsCntsPorPagarFijas,
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CuentasPorPagarCreateApiType = {
          empresa: value.empresa.trim().toUpperCase(),
          detalle: value.detalle.trim().toUpperCase(),
          monto_esperado: value.monto_esperado,
          moneda: value.moneda,
          dia_pago: value.dia_pago,
          categoria: value.categoria.trim().toUpperCase(),
        };
        await mutateAsync(payload);
        message.success("Registrado exitosamente");
        formApi.reset();
        onClose();
      } catch (err) {

        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioFieldCuentasPorPagarFijas);

          if (err.kind !== "validation") {
            message.error(err.message);
          }
        } else {
          message.error("Error inesperado. Intente de nuevo.");
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
          <FromCntsPorPabarFijas form={form} />
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
