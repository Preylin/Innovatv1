import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { useReposteCobrosPagosActual } from "../cuentasPorCobrar/data/api.CntsCobrarTableReporte";
import { useFilterManager } from "../cuentasPorCobrar/hooks/useFilterManager";
import { useCajaChicaSaldoNeto } from "../efectivo/data/api.cajaChica";

export function PanelMostrarDerehosObligacionesFilter() {
  const { data: dataApi, isLoading } = useReposteCobrosPagosActual();
  const { data: dataSaldos } = useCajaChicaSaldoNeto();

  const {
    cuentasCobrar,
    cuentasPagar,
    totalCuentasCobrar,
    totalCuentasPagar,
    totalesCobrar,
    totalesPagar,
    totalesGenerales,
    setRangoFechas,
    toggleCheck,
    exportarCobros,
    exportarPagos,
  } = useFilterManager(dataApi, dataSaldos);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        Cargando registros de vencimientos...
      </div>
    );
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const val = e.target.value ? new Date(e.target.value) : null;
    setRangoFechas((prev) => {
      const current = prev || [null, null];
      const next: [Date | null, Date | null] =
        index === 0 ? [val, current[1]] : [current[0], val];
      return next;
    });
  };

  const formatearMoneda = (monto: number, moneda: string) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: moneda,
    }).format(monto);
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Controles de Filtro */}
      <section className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Vencimientos:
        </span>
        <input
          type="date"
          className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          onChange={(e) => handleDateChange(e, 0)}
        />
        <span className="text-slate-400 text-sm">al</span>
        <input
          type="date"
          className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          onChange={(e) => handleDateChange(e, 1)}
        />
      </section>

      {/* Contenedor Principal de Tablas Cortas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* CUENTAS POR COBRAR */}
        <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-3 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-base flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Cuentas por Cobrar</span>
              <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full font-medium">
                {totalCuentasCobrar} reg.
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                Ingresos
              </span>
              <button
                title="Exportar Cobros Filtrados"
                onClick={exportarCobros}
                className="p-1.5 border border-slate-200 rounded-md shadow-sm bg-white hover:bg-slate-50 text-emerald-600 transition-colors"
              >
                <PiMicrosoftExcelLogoFill size={16} />
              </button>
            </div>
          </h2>

          <div className="flex flex-col gap-2 h-72 overflow-y-auto pr-1">
            {cuentasCobrar.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No hay cuentas por cobrar pendientes.
              </p>
            ) : (
              cuentasCobrar.map((item) => (
                <div
                  key={item.key}
                  className="bg-white text-[9px] lg:text-[11px] p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-row gap-3 items-center hover:border-slate-300 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={item.is_check}
                    onChange={() => toggleCheck(item.key)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <div className="grid grid-cols-5 gap-1 w-full  text-slate-600 items-center">
                    <span className="font-medium col-span-2 text-slate-900 truncate" title={item.nombre}>
                      {item.nombre}
                    </span>
                    <span className="text-center font-mono bg-slate-100 py-0.5 rounded">
                      {item.tabla}
                    </span>
                    <span className="text-right font-semibold text-slate-800">
                      {formatearMoneda(item.monto_pendiente, item.moneda)}
                    </span>
                    <span className="text-right text-slate-500 font-medium truncate">
                      {item.dias}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <span>Total Soles: <span className="text-emerald-600">{formatearMoneda(totalesCobrar.soles, "PEN")}</span></span>
            <span>Total Dólares: <span className="text-emerald-600">{formatearMoneda(totalesCobrar.dolares, "USD")}</span></span>
          </div>
        </div>

        {/* CUENTAS POR PAGAR */}
        <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-3 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-base flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Cuentas por Pagar</span>
              <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full font-medium">
                {totalCuentasPagar} reg.
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-medium">
                Obligaciones
              </span>
              <button
                title="Exportar Pagos Filtrados"
                onClick={exportarPagos}
                className="p-1.5 border border-slate-200 rounded-md shadow-sm bg-white hover:bg-slate-50 text-emerald-600 transition-colors"
              >
                <PiMicrosoftExcelLogoFill size={16} />
              </button>
            </div>
          </h2>

          <div className="flex flex-col gap-2 h-72 overflow-y-auto pr-1">
            {cuentasPagar.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No hay cuentas por pagar pendientes.
              </p>
            ) : (
              cuentasPagar.map((item) => (
                <div
                  key={item.key}
                  className="bg-white text-[9px] lg:text-[11px] p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-row gap-3 items-center hover:border-slate-300 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={item.is_check}
                    onChange={() => toggleCheck(item.key)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <div className="grid grid-cols-5 gap-1 w-full text-slate-600 items-center">
                    <span className="font-medium col-span-2 text-slate-900 truncate" title={item.nombre}>
                      {item.nombre}
                    </span>
                    <span className="text-center font-mono bg-slate-100 py-0.5 rounded ">
                      {item.tabla}
                    </span>
                    <span className="text-right font-semibold text-slate-800">
                      {formatearMoneda(item.monto_pendiente, item.moneda)}
                    </span>
                    <span className="text-right text-slate-500 font-medium truncate">
                      {item.dias}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <span>Total Soles: <span className="text-rose-600">{formatearMoneda(totalesPagar.soles, "PEN")}</span></span>
            <span>Total Dólares: <span className="text-rose-600">{formatearMoneda(totalesPagar.dolares, "USD")}</span></span>
          </div>
        </div>
      </section>

      {/* SALDOS GENERALES PROYECTADOS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-900 text-white shadow-sm flex flex-row gap-4 items-center justify-center">
          <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">
            Caja + Bancos Proyectado (Soles)
          </span>
          <div className="text-xl font-bold font-mono">
            {formatearMoneda(totalesGenerales.soles, "PEN")}
          </div>
        </div>
        <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-900 text-white shadow-sm flex flex-row gap-4 items-center justify-center">
          <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">
            Bancos Proyectado (Dólares)
          </span>
          <div className="text-xl font-bold font-mono">
            {formatearMoneda(totalesGenerales.dolares, "USD")}
          </div>
        </div>
      </section>
    </div>
  );
}