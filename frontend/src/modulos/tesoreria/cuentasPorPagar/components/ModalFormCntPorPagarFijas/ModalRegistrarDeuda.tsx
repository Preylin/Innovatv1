import { type CuentasPorPagarCreateApiType } from "../../data/api.shemaCuentasPorCobar";
import { useCreateObligacionPagar } from "../../data/api.cuentasPorPagar";
import { Modal } from "antd";
import { useAppForm } from "../formulario/components/core/form";
import { FormOptsCntsPorPagarFijas } from "./StructureFormDataCntPagarFijas";
import { FromCntsPorPabarFijas } from "./ComposeUICntPagarFijas";
import { FaPlus } from "react-icons/fa";

interface Props {
  open: boolean;
  onClose: () => void;
  mesActual: string;
}

export function FormNuevaObligacion({ open, onClose, mesActual }: Props) {
  const { mutate, isPending } = useCreateObligacionPagar(mesActual);

  // Inicialización de TanStack Form
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
        await mutate(payload);
        formApi.reset();
        onClose();
      } catch (err) {
        alert(err);
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
