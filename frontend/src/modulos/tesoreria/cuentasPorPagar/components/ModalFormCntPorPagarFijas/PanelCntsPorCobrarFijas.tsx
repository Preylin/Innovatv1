import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  getDate,
  isBefore,
  isSameMonth,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { es } from "date-fns/locale";
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
import { App, Dropdown, Popconfirm, type MenuProps } from "antd";
import ButtonUpdate from "../../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../../components/molecules/botons/BottonDelete";
import { ModalEditarCntsPagarFijas } from "./EditarRegistrosCntPagarFijas";

// const FECHA_SIMULADA = new Date("2026-05-04");
const checkIsVencido = (
  item: any,
  mesVisualizado: Date,
  fechaReferencia: Date,
) => {
  if (item.estado_pago === "TOTAL") return false;
  const inicioMesUI = startOfMonth(mesVisualizado);
  const inicioMesReal = startOfMonth(fechaReferencia);
  if (isBefore(inicioMesUI, inicioMesReal)) return true;
  if (isSameMonth(inicioMesUI, inicioMesReal)) {
    return getDate(fechaReferencia) > item.dia_pago;
  }
  return false;
};

interface ObligacionItemProps {
  item: CuentasPorPagarResumenMensualSchemaApiOutType;
  estaVencido: boolean;
  hoy: Date;
}

export function ObligacionItem({
  item,
  estaVencido,
  hoy,
}: ObligacionItemProps) {
  const diaActual = getDate(hoy);
  const montoPagado = item.monto_pagado_actual || 0;
  const diferencia = item.monto_esperado - montoPagado;
  const esParcial = item.estado_pago === "PARCIAL";
  const estaIncompleto = item.estado_pago !== "TOTAL";
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
          {estaIncompleto && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter shadow-sm truncate ${estaVencido ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-white"}`}
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
              {item.categoria ? item.categoria : "Servicios básicos"}
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

      {item.detalle && (
        <div className="px-2 py-1 text-[9px] font-mono shadow-xs shadow-mist-300 rounded-xs">
          <div className="flex flex-row gap-2">
            <TbFileDescription fontSize={15} />
            <p className="text-slate-500">{item.detalle}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CuentasPorPagarFijas() {
  const [mesActual, setMesActual] = useState(startOfMonth(new Date()));
  const mesActualString = format(mesActual, "yyyy-MM-01");
  const { message } = App.useApp();

  // Generar meses del año (useMemo para no recalcular en cada render)
  const mesesDelAño = useMemo(() => {
    const inicio = startOfYear(mesActual);
    return Array.from({ length: 12 }, (_, i) => {
      const fecha = addMonths(inicio, i);
      return { fecha, etiqueta: format(fecha, "MMM", { locale: es }) };
    });
  }, [mesActual.getFullYear()]); // Solo cambia si cambias de año

  const [itemAPagar, setItemAPagar] =
    useState<CuentasPorPagarResumenMensualSchemaApiOutType | null>(null);
  const { data, isLoading } = useCuentasPorPagarResumenMensual(mesActualString);
  const registrarPago = useRegistrarPago(mesActualString);
  const { mutate } = useDeleteObligacionPagar();
  const ModalRegistrar = useToggle();
  const ModalEditar = useUpdateModal<number>();

  const handleConfirmarPago = (payload: any) => {
    registrarPago.mutate(payload, { onSuccess: () => setItemAPagar(null) });
  };

  const items = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      label: <ButtonUpdate onClick={() => ModalEditar.handlerOpen(id)} />,
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="¿Eliminar?"
          onConfirm={() =>
            mutate(id, { onSuccess: () => message.success("Eliminado") })
          }
        >
          <ButtonDelete style={{ margin: "0px" }} />
        </Popconfirm>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        ...Cargando...
      </div>
    );

  return (
    <div>
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
          mesActual={mesActualString}
          isPending={registrarPago.isPending}
          onClose={() => setItemAPagar(null)}
          onSuccess={handleConfirmarPago}
        />
      )}

      <header className="sticky top-0 z-10 w-full bg-mist-50 px-1 pb-3 md:px-4 rounded-b-xl shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-1 gap-2 items-center">
            <h2 className="text-2xl font-black text-slate-900 italic uppercase">
              Obligaciones <span className="text-indigo-600">Fijas</span>
            </h2>
            <div className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-widest text-center">
              {format(mesActual, "MMMM yyyy", { locale: es })}
            </div>
          </div>
          <div className="">
            <ButtomNew onClick={ModalRegistrar.toggle} />
          </div>
        </div>

        {/* TABS DE MESES */}
        <div className="bg-white p-1 rounded-xl shadow-inner border border-slate-100">
          <div className="flex justify-between gap-1 overflow-x-auto no-scrollbar">
            {mesesDelAño.map((mes) => {
              const isActive = isSameMonth(mes.fecha, mesActual);
              return (
                <button
                  key={mes.etiqueta}
                  onClick={() => setMesActual(mes.fecha)}
                  className={`flex-1 min-w-13.75 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {mes.etiqueta}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="px-1 md:px-2 py-2">
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" >
          {data
            ?.filter((ob) => {
              const inicioMesCreacion = startOfMonth(
                new Date(ob.fecha_creacion),
              );
              const inicioMesVisualizado = startOfMonth(mesActual);
              return !isBefore(inicioMesVisualizado, inicioMesCreacion);
            })
            .map((ob) => {
              const fechaHoy = new Date();
              const estaVencido = checkIsVencido(ob, mesActual, fechaHoy);

              return (
                <Dropdown
                  key={ob.id}
                  menu={{ items: items(ob.id) }}
                  trigger={["contextMenu"]}
                >
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      ob.estado_pago === "TOTAL"
                        ? "bg-slate-50 border-slate-100 opacity-75"
                        : estaVencido
                          ? "bg-white border-red-200 shadow-lg shadow-red-50"
                          : "bg-white border-slate-200 hover:shadow-xl"
                    }`}
                  >
                    <ObligacionItem
                      item={ob}
                      estaVencido={estaVencido}
                      hoy={fechaHoy}
                    />
                    <div className="mt-4 flex justify-end">
                      {ob.estado_pago !== "TOTAL" && (
                        <button
                          onClick={() => setItemAPagar(ob)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase text-white shadow-lg ${
                            estaVencido ? "bg-red-600" : "bg-slate-900"
                          }`}
                        >
                          {ob.estado_pago === "PARCIAL"
                            ? "Completar Pago"
                            : "Pagar Ahora"}
                        </button>
                      )}
                    </div>
                  </div>
                </Dropdown>
              );
            })}
        </div>
      </main>

      <FormNuevaObligacion
        mesActual={mesActualString}
        open={ModalRegistrar.isToggled}
        onClose={ModalRegistrar.toggle}
      />
      <ModalEditarCntsPagarFijas
        id={ModalEditar.data ?? 0}
        open={ModalEditar.isToggled}
        onClose={ModalEditar.handlerClose}
        mesActual={mesActualString}
      />
    </div>
  );
}
