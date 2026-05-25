import { App, Modal, Spin, DatePicker } from "antd";
import { useAppForm } from "../../../../components/tanstackform/components/core/form";
import {
  FormRegistroCobro,
  isUsuarioFieldCntRegistroCobro,
} from "./formulario/StructureFormData";
import { ApiError } from "../../../../api/normalizeError";
import { setFormErrors } from "../../../../helpers/formHelpers";
import { FromCntsPorCobrarUnico } from "./formulario/Compose";
import {
  useCreateRegistroCobroMovimientoCajaVentas,
  useCuentasPorCobrarDetalleMovimientoCajaVentas,
  useCuentasPorCobrarIndividualVentas,
  useDeleteRegistoMovimientoCajaVentas,
  useUpdateFechaDetraccionRetencion,
} from "../data/api.CntsCobrarTableReporte";
import type {
  CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApiType,
  CuentasPorCobrarDetalleOnetoOneReadSchemaApiType,
  RegistrarCobroSchemaApiType,
  UpdateFechaPagoRetencionDetraccionSchemaApiType,
} from "../data/api.schemaCntsCobrarTableReporte";
import { format, parse } from "date-fns";
import { useMemo, useState } from "react";
import { CiViewList } from "react-icons/ci";
import { renderFechaSegura } from "../../../../helpers/Fechas";

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
  total: number;
  tipo_cambio: number;
  moneda: string;
  monto_detraccion: number;
  monto_retencion: number;
  nro_orden_compra?: string | null | undefined;
  nro_guia_remision?: string | null | undefined;
  fecha_pago_detraccion_retencion?: string | null | undefined;
  descripcion_comprobante?: string | null | undefined;
}

interface DataCajaVentas {
  id: number;
  monto_pagado: number;
  fecha_pago?: string | null;
  lugar_ingreso?: string | null;
  medio_pago?: string | null;
  glosa_pago?: string | null;
}

const mapDataApiVentas = (
  item: CuentasPorCobrarDetalleOnetoOneReadSchemaApiType,
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
    total: Number(item.total.toFixed(2) || 0) || 0,
    tipo_cambio: item.tipo_cambio || 1,
    moneda: item.moneda || "-",
    monto_detraccion: Number(item.monto_detraccion.toFixed(2) || 0) || 0,
    monto_retencion: Number(item.monto_retencion.toFixed(2) || 0) || 0,
    nro_orden_compra: item.nro_orden_compra || "-",
    nro_guia_remision: item.nro_guia_remision || "-",
    fecha_pago_detraccion_retencion:
      item.fecha_pago_detraccion_retencion || "-",
    descripcion_comprobante: item.descripcion_comprobante || "-",
  };
};

const mapDataApiCajaVentas = (
  data: CuentasPorCobrarDetalleMovimientoCajaVentasSchemaApiType[],
): DataCajaVentas[] => {
  return data.map((item) => ({
    id: item.id,
    monto_pagado: Number(item.monto_pagado.toFixed(2) || 0) || 0,
    fecha_pago: item.fecha_pago || "-",
    lugar_ingreso: item.lugar_ingreso || "-",
    medio_pago: item.medio_pago || "-",
    glosa_pago: item.glosa_pago || "-",
  }));
};

const formatPEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function ModalRegistroCntsPorCobrar({
  id,
  open,
  onClose,
  day,
}: ModalProps) {
  const { message } = App.useApp();

  const [FechaActualizar, setFechaActualizar] = useState<string>("");

  const {
    data: VentasCobrar,
    isLoading,
    isError,
  } = useCuentasPorCobrarIndividualVentas(id);
  const { data: CajaVentasIndividual } =
    useCuentasPorCobrarDetalleMovimientoCajaVentas(id);

  const { mutateAsync, isPending } =
    useCreateRegistroCobroMovimientoCajaVentas();

  const { mutate } = useDeleteRegistoMovimientoCajaVentas();
  const {
    mutateAsync: mutateAsyncUpdateFechaDetracionRetencion,
    isPending: isPendingUpdateFechaDetracionRetencion,
  } = useUpdateFechaDetraccionRetencion(id);

  const Ventas = useMemo(() => {
    if (!VentasCobrar) return null;
    return mapDataApiVentas(VentasCobrar);
  }, [VentasCobrar]);

  const CajaVentas = useMemo(() => {
    if (!CajaVentasIndividual) return null;
    return mapDataApiCajaVentas(CajaVentasIndividual);
  }, [CajaVentasIndividual]);

  const tieneRetencionODetraccion = Ventas
    ? Ventas.monto_retencion > 0 || Ventas.monto_detraccion > 0
    : false;

  const ValorVenta = ((Ventas?.base_imponible || 0) /
    (Ventas?.tipo_cambio || 1)) as number;

  const IGV = ((Ventas?.igv || 0) / (Ventas?.tipo_cambio || 1)) as number;

  const TotalVentas = ((Ventas?.total || 0) /
    (Ventas?.tipo_cambio || 1)) as number;

  const TotalCobrar = (Ventas?.total || 0) - ((Ventas?.monto_detraccion || 0) + (Ventas?.monto_retencion || 0));

  const TotalCobrarConvertido = (TotalCobrar / (Ventas?.tipo_cambio || 1)) as number;


  const PagoMaximo = Number(TotalCobrarConvertido.toFixed(2));

  const TotalCobrado = useMemo(() => {
    if (!CajaVentas) return 0;
    return CajaVentas.reduce((acc, item) => acc + item.monto_pagado, 0);
  }, [CajaVentas]);

  const MostarFormulario = TotalCobrado < PagoMaximo;
  const ValorMaximoInputNumber = PagoMaximo - TotalCobrado;

  const ExistFechaDetraccion =
    renderFechaSegura(Ventas?.fecha_pago_detraccion_retencion) == "-" &&
    tieneRetencionODetraccion;

  const handlerDelete = (id: number) => {
    mutate(id);
    message.success("Eliminado exitosamente");
  };

  const handlerUpdateFechaDetracionRetencion = async (
    fechaString: string | null,
  ) => {
    try {
      let fechaFinal: string | null = null;

      if (fechaString && fechaString.trim() !== "") {
        const fechaObjeto = parse(fechaString, "dd/MM/yyyy", new Date());
        fechaFinal = format(fechaObjeto, "yyyy-MM-dd");
      }

      const payload: UpdateFechaPagoRetencionDetraccionSchemaApiType = {
        fecha_pago_detraccion_retencion: fechaFinal,
      };

      await mutateAsyncUpdateFechaDetracionRetencion(payload);
      message.success("Actualizado exitosamente");
    } catch (err) {
      console.error(err);
      message.error("Hubo un problema al actualizar la fecha.");
    }
  };

  const form = useAppForm({
    ...FormRegistroCobro,
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: RegistrarCobroSchemaApiType = {
          venta_id: id,
          fecha_pago: format(value.fecha_pago, "yyyy-MM-dd"),
          status_cobro: value.status_cobro,
          monto_pagado: value.monto_pagado,
          lugar_ingreso: value.lugar_ingreso,
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 font-mono ">
            <div className="lg:col-span-2 flex flex-col gap-2 p-2 rounded-md shadow ">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Detalles del Documento:
                </h2>
              </div>
              <div className="text-gray-800 font-mono shadow shadow-mist-300 px-2 py-1 text-xs dark:text-mist-100 rounded-md">
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
                <div>
                  <span>Detalle:</span>{" "}
                  <div className="h-8 overflow-auto text-[8px] px-1">
                    {Ventas.descripcion_comprobante}
                  </div>
                </div>
              </div>

              {tieneRetencionODetraccion ? (
                <div className="rounded-md p-3 text-xs flex flex-col gap-1 font-mono shadow shadow-mist-300">
                  {Ventas.monto_detraccion > 0 && (
                    <div>
                      • Monto Detracción:{" "}
                      {formatPEN.format(Ventas.monto_detraccion)}
                    </div>
                  )}

                  {Ventas.monto_retencion > 0 && (
                    <div>
                      • Monto Retención:{" "}
                      {formatPEN.format(Ventas.monto_retencion)}
                    </div>
                  )}
                  {Ventas.fecha_pago_detraccion_retencion &&
                    Ventas.fecha_pago_detraccion_retencion !== "-" && (
                      <div className="flex items-center justify-between bg-green-100/50 p-1.5 rounded-md group relative">
                        <div>
                          Fecha de pago:{" "}
                          {renderFechaSegura(
                            Ventas.fecha_pago_detraccion_retencion,
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            Modal.confirm({
                              title: "¿Remover fecha?",
                              content:
                                "Se eliminará la fecha de pago registrada para esta retención/detracción.",
                              okText: "Sí, remover",
                              okType: "danger",
                              cancelText: "Cancelar",
                              onOk: () =>
                                handlerUpdateFechaDetracionRetencion(null),
                            });
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-1 rounded-md shadow transition-all cursor-pointer text-[8px] font-bold items-center justify-center hidden group-hover:block"
                          title="Eliminar fecha"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 text-xs font-medium">
                  Sin retención ni detracción aplicable.
                </div>
              )}
              {ExistFechaDetraccion && (
                <div className="rounded-md  items-center justify-between p-2 text-xs shadow shadow-mist-300">
                  <div className="flex flex-col gap-1 text-[10px]">
                    <span className="font-semibold">
                      Fecha de pago de retención o detracción:
                    </span>
                    <div className="flex gap-1">
                      <DatePicker
                        size="small"
                        onChange={(_, dateString) =>
                          setFechaActualizar(
                            dateString && typeof dateString === "string"
                              ? dateString
                              : (dateString?.[0] ?? ""),
                          )
                        }
                        className="w-full"
                        format="DD/MM/YYYY"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handlerUpdateFechaDetracionRetencion(FechaActualizar)
                        }
                        disabled={
                          isPendingUpdateFechaDetracionRetencion ||
                          !FechaActualizar
                        }
                        className={`p-2 bg-black rounded-md text-white font-medium transition-all ${
                          isPendingUpdateFechaDetracionRetencion ||
                          !FechaActualizar
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-neutral-800 active:scale-95 cursor-pointer"
                        }`}
                      >
                        {isPendingUpdateFechaDetracionRetencion
                          ? "Guardando..."
                          : "Guardar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 shadow p-2 rounded-md flex flex-col gap-3">
              {CajaVentas && CajaVentas.length > 0 && (
                <div className=" shadow p-2 rounded-md flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Pagos Recibidos:
                  </h3>
                  {CajaVentas.map((pago, index) => (
                    <div
                      key={index}
                      className="text-[9px] text-gray-500 flex flex-row group relative items-center justify-between"
                    >
                      <div className="flex gap-2 justify-between w-full hover:bg-mist-100 p-1 border-b border-gray-200">
                        <span>{index + 1}</span>
                        <span>
                          {Ventas.moneda} {pago.monto_pagado.toFixed(2)}
                        </span>
                        {/* Cambiado por control seguro de fecha en el listado */}
                        <span>{renderFechaSegura(pago.fecha_pago)}</span>
                        <span>{pago.lugar_ingreso}</span>
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
                      <FromCntsPorCobrarUnico
                        form={form}
                        montoMaximo={Number(ValorMaximoInputNumber.toFixed(2))}
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
}
