import { App, Modal, Spin } from "antd";



import { format } from "date-fns";
import { useMemo } from "react";
import { CiViewList } from "react-icons/ci";
import { renderFechaSegura } from "../../../../../helpers/Fechas";
import { setFormErrors } from "../../../../../helpers/formHelpers";
import { ApiError } from "../../../../../api/normalizeError";
import type { CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApiType, CuentasPorPagarProveedoresDetalleOnetoOneReadSchemaApiType, RegistrarPagoProveedoresSchemaApiType } from "../../data/api.schemaPorPagarProveedores";
import { useCreateRegistroCobroMovimientoCajaCompras, useCuentasPorpagarDetalleMovimientoCajaCompras, useCuentasPorPagarIndividualComprasProveedores, useDeleteRegistoMovimientoCajaCompras } from "../../data/api.cntsPorPagarProveedores";
import { isUsuarioFieldCntRegistroCobro } from "../../../cuentasPorCobrar/components/formulario/StructureFormData";
import { FromCntsPorPagarProveedoresUnico } from "./form/Compose";
import { FormRegistroPagoProveedores } from "./form/StructureFormData";
import { useAppForm } from "../../../../../components/tanstackform/components/core/form";

interface ModalProps {
  id: number;
  open: boolean;
  onClose: () => void;
  day: string;
}

interface RowTableVentas {
  id: number;
  periodo: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  serie: string;
  numero: string;
  base_imponible: number;
  igv: number;
  no_gravadas: number;
  otros: number;
  total: number;
  tipo_cambio: number;
  moneda: string;
  descripcion_comprobante?: string | null | undefined;
}

interface DataCajaVentas {
  id: number;
  monto_pagado: number;
  fecha_pago?: string | null;
  lugar_salida?: string | null;
  medio_pago?: string | null;
  glosa_pago?: string | null;
}

const mapDataApiVentas = (
  item: CuentasPorPagarProveedoresDetalleOnetoOneReadSchemaApiType,
): RowTableVentas => {
  return {
    id: item.id,
    periodo: item.periodo || "-",
    fecha_emision: item.fecha_emision || "-",
    fecha_vencimiento: item.fecha_vencimiento || "-",
    serie: item.serie || "-",
    numero: item.numero || "-",
    base_imponible: item.base_imponible || 0,
    igv: item.igv || 0,
    no_gravadas: item.no_gravadas || 0,
    otros: item.otros || 0,
    total: Number(item.total.toFixed(2) || 0) || 0,
    tipo_cambio: item.tipo_cambio || 1,
    moneda: item.moneda || "-",
    descripcion_comprobante: item.descripcion_comprobante || "-",
  };
};

const mapDataApiCajaVentas = (
  data: CuentasPorPagarProveedoresDetalleMovimientoCajaComprasSchemaApiType[],
): DataCajaVentas[] => {
  return data.map((item) => ({
    id: item.id,
    monto_pagado: Number(item.monto_pagado.toFixed(2) || 0) || 0,
    fecha_pago: item.fecha_pago || "-",
    lugar_salida: item.lugar_salida || "-",
    medio_pago: item.medio_pago || "-",
    glosa_pago: item.glosa_pago || "-",
  }));
};



function ModalRegistroCntsPorCobrarProveedores({
  id,
  open,
  onClose,
  day,
}: ModalProps) {
  const { message } = App.useApp();

  const {
    data: VentasCobrar,
    isLoading,
    isError,
  } = useCuentasPorPagarIndividualComprasProveedores(id);
  const { data: CajaVentasIndividual } =
    useCuentasPorpagarDetalleMovimientoCajaCompras(id);

  const { mutateAsync, isPending } =
    useCreateRegistroCobroMovimientoCajaCompras();

  const { mutate } = useDeleteRegistoMovimientoCajaCompras();


  const Ventas = useMemo(() => {
    if (!VentasCobrar) return null;
    return mapDataApiVentas(VentasCobrar);
  }, [VentasCobrar]);

  const CajaVentas = useMemo(() => {
    if (!CajaVentasIndividual) return null;
    return mapDataApiCajaVentas(CajaVentasIndividual);
  }, [CajaVentasIndividual]);

  const ValorVenta = ((Ventas?.base_imponible || 0) /
    (Ventas?.tipo_cambio || 1)) as number;

  const IGV = ((Ventas?.igv || 0) / (Ventas?.tipo_cambio || 1)) as number;

  const TotalVentas = ((Ventas?.total || 0) /
    (Ventas?.tipo_cambio || 1)) as number;

  const TotalCobrar = (Ventas?.total || 0);

  const TotalCobrarConvertido = (TotalCobrar / (Ventas?.tipo_cambio || 1)) as number;


  const PagoMaximo = Number(TotalCobrarConvertido.toFixed(2));

  const TotalCobrado = useMemo(() => {
    if (!CajaVentas) return 0;
    return CajaVentas.reduce((acc, item) => acc + item.monto_pagado, 0);
  }, [CajaVentas]);

  const MostarFormulario = TotalCobrado < PagoMaximo;
  const ValorMaximoInputNumber = PagoMaximo - TotalCobrado;


  const handlerDelete = (id: number) => {
    mutate(id);
    message.success("Eliminado exitosamente");
  };



  const form = useAppForm({
    ...FormRegistroPagoProveedores,
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: RegistrarPagoProveedoresSchemaApiType = {
          compra_id: id,
          fecha_pago: format(value.fecha_pago, "yyyy-MM-dd"),
          status_cobro: value.status_cobro,
          monto_pagado: value.monto_pagado,
          lugar_salida: value.lugar_salida,
          medio_pago: value.medio_pago,
          glosa_pago: value.glosa_pago.trim(),
        };
        await mutateAsync(payload);
        message.success("Registrado exitosamente");
        formApi.reset();
      } catch (err) {
        if (err instanceof ApiError) {
          setFormErrors(err, formApi, isUsuarioFieldCntRegistroCobro);

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
              Registrar Cobro
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
      <Spin spinning={isLoading}>
        {!Ventas ? (
          <div className="text-center py-8 text-gray-400">
            Sin datos disponibles
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 font-mono ">
            <div className="lg:col-span-2 flex flex-col gap-2 ">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Detalles del Documento:
                </h2>
              </div>
              <div className="text-gray-800 font-mono shadow shadow-mist-300 px-2 py-1 text-xs dark:text-mist-100 rounded-md flex flex-col gap-1">
                <div>Periodo: {String(Ventas.periodo)}</div>
                <div>
                  Fecha de Emisión: {renderFechaSegura(Ventas.fecha_emision)}
                </div>
                <div>
                  Fecha de Vencimiento:{" "}
                  {renderFechaSegura(Ventas.fecha_vencimiento)}
                </div>
                <div>
                  Comprobante: {Ventas.serie} - {Ventas.numero}
                </div>
                <div>
                  Valor: {Ventas.moneda} {ValorVenta.toFixed(2)}
                </div>
                <div>
                  IGV: {Ventas.moneda} {IGV.toFixed(2)}
                </div>
                <div>
                  Total: {Ventas.moneda} {TotalVentas.toFixed(2)}
                </div>
                {Ventas.moneda === "USD" && (
                  <div>Tipo de Cambio: {Ventas.tipo_cambio}</div>
                )}
                <div className="flex flex-col gap-1">
                  <span>Detalle:</span>{" "}
                  <p className="text-[10px] line-clamp-2 overflow-hidden text-ellipsis"
                  title={Ventas.descripcion_comprobante || "-"}
                  >
                    {Ventas.descripcion_comprobante}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-3">
              {CajaVentas && CajaVentas.length > 0 && (
                <div className=" shadow p-2 rounded-md flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Pagos Recibidos:
                  </h3>
                  {CajaVentas.map((pago, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-500 flex flex-row group relative items-center justify-between"
                    >
                      <div className="flex gap-2 justify-between w-full hover:bg-mist-100 p-1 border-b border-gray-200">
                        <span>{index + 1}</span>
                        <span>
                          {Ventas.moneda} {pago.monto_pagado.toFixed(2)}
                        </span>
                        {/* Cambiado por control seguro de fecha en el listado */}
                        <span>{renderFechaSegura(pago.fecha_pago)}</span>
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
                      Total Cobrado: {Ventas.moneda} {TotalCobrado.toFixed(2)}
                    </div>
                    {ValorMaximoInputNumber > 0 && (
                      <div>
                        <div
                          title="Falta por cobrar"
                          className="bg-red-200 px-1 rounded-md"
                        >
                          {Ventas.moneda} {ValorMaximoInputNumber.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {ValorMaximoInputNumber < 0 && (
                      <div
                        title="Pago adicional"
                        className="bg-teal-100 px-1 rounded-md"
                      >
                        {Ventas.moneda}{" "}
                        {Number(TotalCobrado - PagoMaximo).toFixed(2)}
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
                      <div className="bg-green-500 px-2 text-white rounded-md text-[10px] font-medium">
                        Total: {Ventas.moneda}{" "}
                        {ValorMaximoInputNumber.toFixed(2)}
                      </div>
                      <form.AppForm>
                        <form.SubscribeButton
                          label="Registrar"
                          isPending={isPending}
                        />
                      </form.AppForm>
                    </div>
                    <div className="">
                      <FromCntsPorPagarProveedoresUnico
                        form={form}
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-2 bg-green-300/70 shadow rounded-md">
                  Cobro completo.
                </div>
              )}
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ModalRegistroCntsPorCobrarProveedores;

