import { App, Modal } from "antd";

import { useQueryClient } from "@tanstack/react-query";
import type {
  CuentasPorPagarEventualActualizarApiType,
  CuentasPorPagarEventualResumenMensualSchemaApiOutType,
} from "../../data/api.shemaCuentasPorCobar";
import { useUpdateObligacionPagarEventuales } from "../../data/api.cuentasPorPagar";
import { RxUpdate } from "react-icons/rx";
import { ApiError } from "../../../../../api/normalizeError";
import { setFormErrors } from "../../../../../helpers/formHelpers";
import { format } from "date-fns";
import { useAppForm } from "../../../../../components/tanstackform/components/core/form";
import { CuentasPorPagarEventualCreateUISchema, isUsuarioFieldCuentasPorPagarEventual } from "./StructureFormDataCntPagarEvent";
import { FromCntsPorPagarEventual } from "./ComposeUICntPagarEvent";

interface Props {
  id: number;
  open: boolean;
  onClose: () => void;
}
export function useCntsPorPagarFijasFromCache(
  id: number,
): CuentasPorPagarEventualResumenMensualSchemaApiOutType | undefined {
  const qc = useQueryClient();

  const usuarios = qc.getQueryData<
    CuentasPorPagarEventualResumenMensualSchemaApiOutType[]
  >(
    ["resumen_mensual_cuentas_por_pagar_eventuales"], // <-- Clave completa
  );

  return usuarios?.find((u) => u.id === id);
}

export function ModalEditarCntsPagarEventuales({
  id,
  open,
  onClose,
}: Props) {
  const { message } = App.useApp();

  const { mutate, isPending } = useUpdateObligacionPagarEventuales(id as number);
  const data = useCntsPorPagarFijasFromCache(id as number);

  const form = useAppForm({
    defaultValues: {
      fecha_emision: String(data?.fecha_emision) ?? "",
      fecha_vencimiento: String(data?.fecha_vencimiento) ?? "",
      empresa: data?.empresa ?? "",
      detalle: data?.detalle ?? "",
      monto_esperado: data?.monto_esperado ?? 0,
      moneda: data?.moneda ?? "",
    },
    validators: {
      onSubmit: CuentasPorPagarEventualCreateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CuentasPorPagarEventualActualizarApiType = {
          fecha_emision: format(value.fecha_emision, "yyyy-MM-dd"),
          fecha_vencimiento: format(value.fecha_vencimiento, "yyyy-MM-dd"),
          empresa: value.empresa.trim().toUpperCase(),
          detalle: value.detalle.trim().toUpperCase(),
          monto_esperado: value.monto_esperado,
          moneda: value.moneda,
        };
        await mutate(payload);
        message.success("Actualizado exitosamente");
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

  const isLoadingData = open && !data && id !== 0;

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
      {isLoadingData ? (
        <div className="p-10 text-center">Cargando datos...</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 dark:text-mist-100">
              <span className="bg-slate-800 text-white p-1.5 rounded-lg text-sm">
                <RxUpdate className="animate-spin" />
              </span>
              Actualizar
            </h3>

            <FromCntsPorPagarEventual form={form} />

            <form.AppForm>
              <div className="flex justify-end mt-4">
                <form.SubscribeButton
                  label="Actualizar Registro"
                  isPending={isPending}
                />
              </div>
            </form.AppForm>
          </div>
        </form>
      )}
    </Modal>
  );
}
