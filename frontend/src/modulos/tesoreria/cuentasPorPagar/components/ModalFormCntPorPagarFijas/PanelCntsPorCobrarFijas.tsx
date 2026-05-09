import { useState } from "react";
import { format, getDate } from "date-fns"; // Importamos getDate para comparar días
import {
  useCuentasPorPagarResumenMensual,
  useDeleteObligacionPagar,
  useRegistrarPago,
} from "../../data/api.cuentasPorPagar";
import { FormNuevaObligacion } from "./ModalRegistrarDeuda";
import { ModalRegistrarPago } from "./ModalRegistrarPago";
import type { CuentasPorPagarResumenMensualSchemaApiOutType } from "../../data/api.shemaCuentasPorCobar";
import { useToggle, useUpdateModal } from "../../../../../hooks/Toggle";
import ButtomNew from "../../../../../components/molecules/botons/BottomNew";
import { TbFileDescription } from "react-icons/tb";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { MdOutlineIncompleteCircle } from "react-icons/md";
import { App, Dropdown, Popconfirm, type MenuProps } from "antd";
import ButtonUpdate from "../../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../../components/molecules/botons/BottonDelete";
import { ModalEditarCntsPagarFijas } from "./EditarRegistrosCntPagarFijas";

// const FECHA_SIMULADA = new Date("2026-05-04");

export function ObligacionItem({
  item,
}: {
  item: CuentasPorPagarResumenMensualSchemaApiOutType;
}) {
    const hoy = new Date();
  // const hoy = FECHA_SIMULADA;

  const diaActual = getDate(hoy);

  const montoPagado = item.monto_pagado_actual || 0;
  const diferencia = item.monto_esperado - montoPagado;

  const esParcial = item.estado_pago === "PARCIAL";
  const estaIncompleto = item.estado_pago !== "TOTAL";
  const estaVencido = diaActual > item.dia_pago && estaIncompleto;

  // CÁLCULO DE DÍAS
  // Math.abs para obtener el número positivo siempre
  const diasDiferencia = Math.abs(diaActual - item.dia_pago);

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center w-auto shadow shadow-mist-300 rounded-md p-2">
        <h4
          className={`font-black text-xs w-7/12 uppercase tracking-tight ${estaVencido ? "text-red-600" : "text-slate-800"}`}
        >
          {item.empresa}
        </h4>

        <div className="w-5/12 flex flex-row gap-1 justify-end">
          <span
            className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase truncate tracking-tighter ${
              item.estado_pago === "TOTAL"
                ? "bg-emerald-100 text-emerald-700"
                : esParcial
                  ? "bg-amber-100 text-amber-700 shadow-sm shadow-amber-100"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {item.estado_pago === "PENDIENTE"
              ? `Pagar día ${item.dia_pago}`
              : item.estado_pago}
          </span>

          {/* CONTADOR DE DÍAS DINÁMICO */}
          {estaIncompleto && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter shadow-sm truncate overflow-hidden ${
                estaVencido
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-500 text-white"
              }`}
            >
              <span className="opacity-80">
                {estaVencido ? "Retraso:" : "Faltan:"}
              </span>
              <span>
                {diasDiferencia} {diasDiferencia === 1 ? "día" : "días"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 items-center">
        <div className="flex flex-wrap gap-6 justify-center w-full">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Categoría
            </p>
            <p className={`text-xs font-mono font-black`}>
              {item.categoria ? item.categoria : "Servicio basicos"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Deuda
            </p>
            <p
              className={`text-xs font-mono font-black ${esParcial ? "text-amber-600" : "text-slate-600"}`}
            >
              {item.moneda} {item.monto_esperado.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Pagado
            </p>
            <p
              className={`text-xs font-mono font-black ${esParcial ? "text-amber-600" : "text-slate-600"}`}
            >
              {item.moneda} {montoPagado.toFixed(2)}
            </p>
          </div>

          {estaIncompleto && diferencia > 0 && (
            <div className="text-center">
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${estaVencido ? "text-red-500" : "text-slate-400"}`}
              >
                {estaVencido ? "Deuda Morosa" : "Faltante"}
              </p>
              <p
                className={`text-xs font-mono font-black ${estaVencido ? "text-red-600" : "text-amber-600"}`}
              >
                {item.moneda} {diferencia.toFixed(2)}
              </p>
            </div>
          )}

          {esParcial && !estaVencido && (
            <span className="text-[9px] text-pink-500 font-bold">
              *(Abono incompleto)
            </span>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden max-w-50">
          <div
            className={`h-full transition-all duration-500 ${
              estaVencido
                ? "bg-red-500"
                : esParcial
                  ? "bg-amber-400"
                  : "bg-indigo-500"
            }`}
            style={{
              width: `${Math.min((montoPagado / item.monto_esperado) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="px-2 py-1 text-[9px] font-mono shadow-xs shadow-mist-300 rounded-xs">
        {item.detalle !== "" && (
          <div className="flex flex-row gap-2">
            <TbFileDescription fontSize={15} />{" "}
            <p className="text-slate-500">{item.detalle}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CuentasPorPagarFijas() {
    const [mesActual] = useState(format(new Date(), "yyyy-MM-01"));
  //prueba
  // const [mesActual] = useState("2027-08-01");
  const [itemAPagar, setItemAPagar] =
    useState<CuentasPorPagarResumenMensualSchemaApiOutType | null>(null);
  const { data, isLoading } = useCuentasPorPagarResumenMensual(mesActual);
  const registrarPago = useRegistrarPago(mesActual);
  const { mutate } = useDeleteObligacionPagar();
  const { message } = App.useApp();

  const ModalRegistrar = useToggle();
  const ModalEditar = useUpdateModal<number>();

  const handleConfirmarPago = (payload: any) => {
    registrarPago.mutate(payload, {
      onSuccess: () => setItemAPagar(null),
    });
  };

  const items = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      label: <ButtonUpdate onClick={() => ModalEditar.handlerOpen(id)} />,
    },
    {
      key: "delete",
      label: (
        <div>
          <Popconfirm
            title="¿Eliminar registro?"
            description="Esta acción no se puede deshacer"
            onConfirm={() =>
              mutate(id, {
                onSuccess: () => message.success("Registro eliminado"),
                onError: (err) => message.error(err.message),
              })
            }
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <ButtonDelete style={{ margin: "0px" }} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-black text-xs uppercase tracking-widest">
          Sincronizando Tesorería...
        </p>
      </div>
    );

  return (
    <div className="">
      {itemAPagar && (
        <ModalRegistrarPago
          obligacion={{
            ...itemAPagar,
            monto_sugerido:
              itemAPagar.estado_pago === "PARCIAL"
                ? itemAPagar.monto_esperado -
                  (itemAPagar.monto_pagado_actual || 0)
                : itemAPagar.monto_esperado,
          }}
          mesActual={mesActual}
          isPending={registrarPago.isPending}
          onClose={() => setItemAPagar(null)}
          onSuccess={handleConfirmarPago}
        />
      )}

      <div className=" mx-auto">
        <header className="flex flex-col justify-between items-start md:items-center mb-3 gap-3 sticky top-0 z-10 w-full bg-mist-50 px-1 pb-3 md:px-2 rounded-bl-md rounded-br-md shadow-sm shadow-mist-300">
          <div className="flex flex-row gap-2 justify-between w-full items-center">
            <div className="text-2xl font-black text-slate-900 tracking-tighter italic">
              OBLIGACIONES <span className="text-indigo-600">FIJAS</span>
            </div>
            <div className="bg-slate-900 text-white px-3 py-1 rounded-xl shadow-lg font-black text-sm uppercase tracking-widest text-center">
              {format(new Date(mesActual), "MMMM yyyy")}
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-between w-full items-center">
            <div className="text-slate-400 text-[12px] md:text-[14px] italic font-black uppercase tracking-[0.2em] text-shadow-2xs">
              Estado de Obligaciones Mensuales
            </div>
            <div>
              <ButtomNew onClick={ModalRegistrar.toggle}></ButtomNew>
              <FormNuevaObligacion
                mesActual={mesActual}
                open={ModalRegistrar.isToggled}
                onClose={ModalRegistrar.toggle}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {data?.map((ob) => {
            const estaVencido =
              getDate(new Date()) > ob.dia_pago && ob.estado_pago !== "TOTAL";

            return (
              <Dropdown
                menu={{ items: items(ob.id) }}
                trigger={["contextMenu"]}
              >
                <div
                  key={ob.id}
                  className={`group flex flex-col items-center justify-between p-3 rounded-md border transition-all duration-300 gap-2 ${
                    ob.estado_pago === "TOTAL"
                      ? "bg-slate-50/50 border-slate-100 opacity-80"
                      : estaVencido
                        ? "bg-white border-red-200 shadow-lg shadow-red-50"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50"
                  }`}
                >
                  <div className="w-full">
                    <ObligacionItem item={ob} />
                  </div>

                  <div className="mt-2 md:mt-0">
                    {ob.estado_pago === "TOTAL" ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 border border-emerald-100 py-1 px-2 rounded-md">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse truncate" />
                        COMPLETADO
                      </div>
                    ) : (
                      <button
                        onClick={() => setItemAPagar(ob)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-lg transition-all transform active:scale-95 ${
                          estaVencido
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                            : "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200"
                        }`}
                      >
                        {ob.estado_pago === "PARCIAL" ? (
                          <div className="flex gap-1 items-center">
                            {" "}
                            <MdOutlineIncompleteCircle className="animate-bounce" />
                            <p>Completar Pago</p>
                          </div>
                        ) : (
                          <div className="flex gap-1 items-center">
                            {" "}
                            <FaMoneyBillTrendUp className="animate-bounce" />
                            <p>Pagar</p>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Dropdown>
            );
          })}
        </div>
        <ModalEditarCntsPagarFijas
          id={ModalEditar.data ?? 0}
          open={ModalEditar.isToggled}
          onClose={ModalEditar.handlerClose}
          mesActual={mesActual}
        />
      </div>
    </div>
  );
}
