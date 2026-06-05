import { App, Modal } from "antd";
import { format } from "date-fns";
import { useMemo } from "react";
import { CiViewList } from "react-icons/ci";
import { renderFechaSegura } from "../../../../../helpers/Fechas";
import { setFormErrors } from "../../../../../helpers/formHelpers";
import { ApiError } from "../../../../../api/normalizeError";
import { useAppForm } from "../../../../../components/tanstackform/components/core/form";
import {
  useCreateRegistroCobroMovimientoCajaEventuales,
  useDeleteRegistoMovimientoCajaEventual,
  useRegistroMovimientoCajaEventuales,
} from "../../data/api.cuentasPorPagar";
import {
  FormRegistroPagoEventuales,
  isUsuarioFieldCntRegistroPagoEventuales,
} from "./StructureFormDataCntPagarEvent";
import type {
  CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApiType,
  RegistrarPagoEventualesSchemaApiType,
} from "../../data/api.shemaCuentasPorCobar";
import { FromCntsPorPagarEventualesUnico } from "./ComposeUICntPagarEvent";

interface ModalProps {
  id: number;
  open: boolean;
  onClose: () => void;
  day: string;
  totalMaximo: number;
  moneda: string;
}

interface DataCajaEventual {
  id: number;
  monto_pagado: number;
  fecha_operacion?: string | null;
  lugar_salida?: string | null;
  medio_pago?: string | null;
  glosa_pago?: string | null;
}

const mapDataApiCajaEventual = (
  data: CuentasPorPagarEventualesDetalleMovimientoCajaComprasSchemaApiType[],
): DataCajaEventual[] => {
  return data.map((item) => ({
    id: item.id,
    monto_pagado: Number(item.monto_pagado.toFixed(2) || 0) || 0,
    fecha_operacion: item.fecha_operacion || "-",
    lugar_salida: item.lugar_salida || "-",
    medio_pago: item.medio_pago || "-",
    glosa_pago: item.glosa_pago || "-",
  }));
};

function ModalRegistroCntsPorPagarEventuales({
  id,
  open,
  onClose,
  day,
  totalMaximo,
  moneda,
}: ModalProps) {
  const { message } = App.useApp();

  const { data: CajaEventualIndividual, isError } =
    useRegistroMovimientoCajaEventuales(id);

  const { mutateAsync, isPending } =
    useCreateRegistroCobroMovimientoCajaEventuales();

  const { mutate } = useDeleteRegistoMovimientoCajaEventual();

  const CajaEventual = useMemo(() => {
    if (!CajaEventualIndividual) return null;
    return mapDataApiCajaEventual(CajaEventualIndividual);
  }, [CajaEventualIndividual]);

  const TotalCobrado = useMemo(() => {
    if (!CajaEventual) return 0;
    return CajaEventual.reduce((acc, item) => acc + item.monto_pagado, 0);
  }, [CajaEventual]);

  const MostarFormulario = TotalCobrado < totalMaximo;
  const TotalPorPagar = totalMaximo - TotalCobrado;
  const ValorMaximoInputNumber = totalMaximo - TotalCobrado;

  const handlerDelete = (id: number) => {
    mutate(id);
    message.success("Eliminado exitosamente");
  };

  const form = useAppForm({
    ...FormRegistroPagoEventuales,
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: RegistrarPagoEventualesSchemaApiType = {
          obligacion_id: id,
          fecha_operacion: format(value.fecha_operacion, "yyyy-MM-dd"),
          lugar_salida: value.lugar_salida.trim(),
          status_cobro: value.status_cobro,
          monto_pagado: value.monto_pagado,
          medio_pago: value.medio_pago,
          glosa_pago: value.glosa_pago.trim(),
        };
        await mutateAsync(payload);
        message.success("Registrado exitosamente");
        formApi.reset();
      } catch (err) {
        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioFieldCntRegistroPagoEventuales);

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

  if (isError) {
    const finalMessage = (isError as any)?.message || "Error en el servidor";
    message.error(finalMessage);
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <CiViewList className="animate-bounce" />

            <h1 className="text-xs md:text-lg font-semibold text-gray-800 dark:text-mist-100">
              Registrar Pago
            </h1>
            <div className="text-[9px] font-medium text-gray-500">
              ID: <span className="text-blue-600 font-bold">#{id}</span>
            </div>
          </div>
          <span className="bg-blue-50 text-blue-600 text-[9px] md:text-xs truncate font-medium px-1.5 py-1 rounded border border-blue-200">
            {day}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={{ xs: "90%", sm: "80%", lg: "70%" }}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
    >
      <div className="lg:col-span-3 flex flex-col gap-3">
        {CajaEventual && CajaEventual.length > 0 && (
          <div className=" shadow p-2 rounded-md flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Pagos Recibidos:
            </h3>
            {CajaEventual.map((pago, index) => (
              <div
                key={index}
                className="text-xs text-gray-500 flex flex-row group relative items-center justify-between"
              >
                <div className="flex gap-2 justify-between w-full hover:bg-mist-100 p-1 border-b border-gray-200">
                  <span>{index + 1}</span>
                  <span>
                    {moneda} {pago.monto_pagado.toFixed(2)}
                  </span>
                  {/* Cambiado por control seguro de fecha en el listado */}
                  <span>{renderFechaSegura(pago.fecha_operacion)}</span>
                  <span>{pago.lugar_salida}</span>
                  <span>{pago.medio_pago}</span>
                  {pago.glosa_pago && (
                    <span className="max-w-50 hidden group-hover:block uppercase text-[6px]">
                      {pago.glosa_pago}
                    </span>
                  )}
                </div>
                <div
                  className="text-red-700 cursor-pointer px-1 hidden group-hover:block"
                  onClick={() => {
                    Modal.confirm({
                      title: "¿Eliminar registro?",
                      content:
                        "Se eliminará el registro de este cobro de forma permanente.",
                      okText: "Sí, remover",
                      okType: "danger",
                      cancelText: "Cancelar",
                      onOk: () => handlerDelete(pago.id),
                    });
                  }}
                >
                  x
                </div>
              </div>
            ))}
            <div className="text-[9px] font-medium mt-1 flex flex-row items-center justify-between">
              <div>
                Total Cobrado: {moneda} {TotalCobrado.toFixed(2)}
              </div>
              {ValorMaximoInputNumber > 0 && (
                <div>
                  <div
                    title="Falta por cobrar"
                    className="bg-red-200 px-1 rounded-md"
                  >
                    {moneda} {ValorMaximoInputNumber.toFixed(2)}
                  </div>
                </div>
              )}
              {ValorMaximoInputNumber < 0 && (
                <div
                  title="Pago adicional"
                  className="bg-teal-100 px-1 rounded-md"
                >
                  {moneda} {Number(TotalCobrado - totalMaximo).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

        {MostarFormulario ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between gap-3 w-full items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Formulario de Cobro
                </h2>
                <div className="bg-red-500 px-2 text-white rounded-md text-[10px] font-medium">
                  Total: {moneda} {TotalPorPagar.toFixed(2)}
                </div>
                <form.AppForm>
                  <form.SubscribeButton
                    label="Registrar"
                    isPending={isPending}
                  />
                </form.AppForm>
              </div>
              <div className="">
                <FromCntsPorPagarEventualesUnico form={form} />
              </div>
            </div>
          </form>
        ) : (
          <div className="p-2 bg-green-300/70 shadow rounded-md">
            Pago completado.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalRegistroCntsPorPagarEventuales;
