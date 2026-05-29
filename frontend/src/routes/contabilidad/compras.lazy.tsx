import { createLazyFileRoute } from '@tanstack/react-router'
import { useToggle } from '../../hooks/Toggle';
import { useState } from 'react';
import { Button, Empty, Select, Spin } from 'antd';
import { LuCalendarDays, LuFileUp, LuInfo, LuSearch } from 'react-icons/lu';
import HistorialComprasImportMasivaExcel from '../../modulos/contabilidad/ventas/components/ModalImportalMasivoCompras';
import { useYearsContabilidadCompras } from '../../modulos/contabilidad/compras/data/api.smallConsultasCompras';
import TablaContabilidadCompras from '../../modulos/contabilidad/compras/components/TablaMostrarActualizarCompras';

export const Route = createLazyFileRoute('/contabilidad/compras')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PanelCompras />
}


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

 function PanelCompras() {
  const { isToggled, toggle } = useToggle();
  const { data: years, error, isLoading } = useYearsContabilidadCompras();

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
    <div className="w-full min-w-140 h-[calc(100vh-58px)] animate-in fade-in duration-500 flex flex-col">
      {/* Header y Filtros */}
      <header className="min-h-15 flex flex-wrap flex-row items-center justify-between gap-2 px-2">
        <div className="space-y-1">
          <div className="flex gap-3 items-center ">
            <h1 className="text-xl font-bold text-gray-900 dark:text-mist-50 tracking-tight">
              Registro de Compras
            </h1>
            {busquedaPeriodo && (
              <div className="flex items-center gap-1 px-1 py-0.5 bg-blue-50 rounded-md border border-blue-100">
                <LuCalendarDays className="text-blue-600" />
                <div className="flex gap-2 items-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                    Periodo:
                  </p>
                  <p className="text-xs font-mono font-bold text-blue-900">
                    {busquedaPeriodo}
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <LuInfo size={14} /> Gestión de periodos y operaciones contables
          </p>
        </div>

        <div className="flex items-center gap-3 px-2 py-1.5 bg-mist-50 rounded-lg border border-mist-200">
          {/* Selector Año */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase ml-2">
              Año:
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
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Mes:
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
          >
            Importar
          </Button>
        </div>
      </header>

      {/* Área de Contenido / Resultados */}
      <main className="flex-1 py-1 overflow-hidden relative">
        {busquedaPeriodo ? (
          <div className=""><TablaContabilidadCompras periodo={busquedaPeriodo} /></div>
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
      <HistorialComprasImportMasivaExcel open={isToggled} onClose={toggle} />

      {/* Manejo de error flotante o inline */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
          Error al cargar años: {error.message}
        </div>
      )}
    </div>
  );
}
