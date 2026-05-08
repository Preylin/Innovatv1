import { Modal } from "antd";
import { CuentasPorPagarCreateUISchema } from "./StructureFormDataCntPagarFijas";
import { useAppForm } from "../formulario/components/core/form";
import { useQueryClient } from "@tanstack/react-query";
import type {
  CuentasPorPagarCreateApiType,
  CuentasPorPagarResumenMensualSchemaApiOutType,
} from "../../data/api.shemaCuentasPorCobar";
import { FromCntsPorPabarFijas } from "./ComposeUICntPagarFijas";
import { useUpdateObligacionPagar } from "../../data/api.cuentasPorPagar";
import { RxUpdate } from "react-icons/rx";

interface Props {
  id: number;
  open: boolean;
  onClose: () => void;
  mesActual: string;
}
export function useCntsPorPagarFijasFromCache(
  id: number,
  mesActual: string, // <-- Agregamos el mes
): CuentasPorPagarResumenMensualSchemaApiOutType | undefined {
  const qc = useQueryClient();

  const usuarios = qc.getQueryData<
    CuentasPorPagarResumenMensualSchemaApiOutType[]
  >(
    ["resumen_mensual_cuentas_por_pagar", mesActual], // <-- Clave completa
  );

  return usuarios?.find((u) => u.id === id);
}

export function ModalEditarCntsPagarFijas({
  id,
  open,
  onClose,
  mesActual,
}: Props) {
  // 1. Todos los Hooks se declaran arriba del todo
  const { mutate, isPending } = useUpdateObligacionPagar(id as number);
  const data = useCntsPorPagarFijasFromCache(id as number, mesActual);

  const form = useAppForm({
    defaultValues: {
      empresa: data?.empresa ?? "",
      detalle: data?.detalle ?? "",
      monto_esperado: data?.monto_esperado ?? 0,
      moneda: data?.moneda ?? "",
      dia_pago: data?.dia_pago ?? 1,
      categoria: data?.categoria ?? "",
    },
    validators: {
      onSubmit: CuentasPorPagarCreateUISchema,
    },
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
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-slate-800 text-white p-1.5 rounded-lg text-sm">
                <RxUpdate className="animate-spin" />
              </span>
              Actualizar Obligación Fija
            </h3>

            <FromCntsPorPabarFijas form={form} />

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
