import { createLazyFileRoute } from "@tanstack/react-router";
import { useToggle } from "../../hooks/Toggle";
import { Button, Empty, Select, Spin } from "antd";
import HistorialVentasImportMasivaExcel from "../../modulos/contabilidad/ventas/components/ModalImportarMasivo";
import { useYearsContabilidadVentas } from "../../modulos/contabilidad/ventas/data/api.ventas/api.smallConsultas";

export const Route = createLazyFileRoute("/contabilidad/ventas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ModalVentas />;
}

import { useState } from "react";
import { LuSearch, LuFileUp, LuCalendarDays, LuInfo } from "react-icons/lu"; // Opcional: Iconos para mejor UX
import TablaContabilidadVentas from "../../modulos/contabilidad/ventas/components/TablaMostrarActualizarVentas";

// Constante fuera del componente para evitar re-renders
const OPCIONES_MESES = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

export default function ModalVentas() {
  const { isToggled, toggle } = useToggle();
  const { data: years, error, isLoading } = useYearsContabilidadVentas();

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [busquedaPeriodo, setBusquedaPeriodo] = useState("");

  const handleBuscar = () => {
    if (selectedYear && selectedMonth) {
      setBusquedaPeriodo(`${selectedYear}${selectedMonth}`);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Spin size="large" />
        <p className="text-gray-500 animate-pulse">
          Preparando periodos contables...
        </p>
      </div>
    );

  return (
    <div className="w-full min-w-140 h-[calc(100vh-58px)] space-y-1 animate-in fade-in duration-500 flex flex-col">
      {/* Header y Filtros */}
      <header className="min-h-15 flex flex-wrap lg:flex-row lg:items-center justify-between gap-2 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex gap-3 items-center ">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Registro de Ventas
            </h1>
            {busquedaPeriodo && (
              <div className="flex items-center gap-3 px-1 bg-blue-50 rounded-lg border border-blue-100">
                <LuCalendarDays className="text-blue-600" />
                <div className="flex gap-2 items-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                    Periodo:
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-900">
                    {busquedaPeriodo}
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <LuInfo size={14} /> Gestión de periodos y operaciones contables
          </p>
        </div>

        <div className="flex items-center gap-3 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
          {/* Selector Año */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase ml-2">
              Año
            </span>
            <Select
              className="w-20"
              placeholder="Año"
              value={selectedYear}
              onChange={setSelectedYear}
              options={years?.map((y) => ({ value: y, label: y }))}
            />
          </div>

          {/* Selector Mes */}
          <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Mes
            </span>
            <Select
              className="w-25"
              placeholder="Mes"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={OPCIONES_MESES}
              disabled={!selectedYear}
            />
          </div>

          <Button
            type="primary"
            icon={<LuSearch size={16} />}
            onClick={handleBuscar}
            className="bg-blue-600 flex items-center"
            disabled={!selectedYear || !selectedMonth}
          >
            Buscar
          </Button>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block" />

          <Button
            onClick={toggle}
            icon={<LuFileUp size={16} />}
            className="flex items-center border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:border-emerald-600"
          >
            Importar
          </Button>
        </div>
      </header>

      {/* Área de Contenido / Resultados */}
      <main className="flex-1 bg-white rounded-md border border-gray-200 overflow-hidden shadow-inner relative">
        {busquedaPeriodo ? (
          <div className=""><TablaContabilidadVentas periodo={busquedaPeriodo} /></div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 transition-all">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-400 text-sm max-w-xs block">
                  Selecciona los filtros superiores para visualizar el registro
                  de ventas.
                </span>
              }
            />
          </div>
        )}
      </main>

      {/* Modales Externos */}
      <HistorialVentasImportMasivaExcel open={isToggled} onClose={toggle} />

      {/* Manejo de error flotante o inline */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
          Error al cargar años: {error.message}
        </div>
      )}
    </div>
  );
}
