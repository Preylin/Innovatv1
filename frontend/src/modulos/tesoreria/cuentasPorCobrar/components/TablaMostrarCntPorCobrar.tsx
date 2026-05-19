import { useMemo, useState } from "react";
import {
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoStopwatchOutline 
} from "react-icons/io5";
import {
  sortingFns,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
// Nota: Reemplazar por tu custom hook real de cuentas por pagar cuando exista en tu API
import { useCuentasPorCobrarResumenMensualCaja } from "../data/api.CntsCobrarTableReporte";
import type { ReporteCntsPorCobrarSchemaApiType } from "../data/api.schemaCntsCobrarTableReporte";
import { TableBaseFuzzyCntasPorCobrar } from "./TablaBaseTsKFilterPaginacion";
import { Select } from "antd";
import { useYearsContabilidadVentas } from "../../../contabilidad/ventas/data/api.ventas/api.smallConsultas";
import { differenceInCalendarDays, isValid } from "date-fns";

export interface DataTableCntsPorPagar {
  key: number;
  id: number;
  fecha_emision: string | Date;
  fecha_vencimiento: string | Date;
  status_fecha: string; // Días restantes o de retraso
  cliente_razon_social: string;
  total: number;
  monto_detraccion: number;
  monto_retencion: number;
  moneda: string;
  tipo_cambio: number;
  fecha_pago: string | Date | null;
  monto_pagado: number;
  status_pago: string; // PENDIENTE, PARCIAL, CANCELADO
  link_pdf: string;
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};
function obtenerTextoAlertaVencimiento(
  fechaVencimientoRaw: Date | string | null | undefined,
  statusPago: string
): string {
  if (statusPago === "CANCELADO") return "Completado";
  if (!fechaVencimientoRaw || fechaVencimientoRaw === "-") return "Sin Fecha";

  const fechaVencimiento = new Date(fechaVencimientoRaw);
  if (!isValid(fechaVencimiento)) return "Fecha Inválida";

  const fechaActual = new Date();
  const dias = differenceInCalendarDays(fechaVencimiento, fechaActual);

  if (dias > 0) {
    return `Faltan ${dias} ${dias === 1 ? "día" : "días"}`;
  } else if (dias === 0) {
    return "Vence Hoy";
  } else {
    const diasRetraso = Math.abs(dias);
    return `Vencido (${diasRetraso} ${diasRetraso === 1 ? "día" : "días"})`;
  }
}


const mapDataTable = (
  data: ReporteCntsPorCobrarSchemaApiType[],
): DataTableCntsPorPagar[] => {
  return data.map((item, index) => {
    // 🚀 Inyectamos el string generado directamente en el modelo de datos
    const textoStatusFecha = obtenerTextoAlertaVencimiento(
      item.fecha_vencimiento, 
      item.status_cobro || "-"
    );

    return {
      key: index + 1,
      id: item.id,
      fecha_emision: item.fecha_emision || "-",
      fecha_vencimiento: item.fecha_vencimiento || "-",
      status_fecha: textoStatusFecha, // Guardado como String legible
      nro_documento: item.nro_documento || "-",
      cliente_razon_social: item.razon_social || "-",
      total: item.total / item.tipo_cambio || 0,
      monto_detraccion: item.monto_detraccion || 0,
      monto_retencion: item.monto_retencion || 0,
      moneda: item.moneda || "-",
      tipo_cambio: item.tipo_cambio || 0,
      fecha_pago: item.fecha_pago || null,
      monto_pagado: item.monto_pagado / item.tipo_cambio || 0,
      status_pago: item.status_cobro || "-",
      link_pdf: item.link_pdf || "-",
    };
  });
};

interface PropsComponent {
  children: React.ReactNode;
  className?: string;
}

// componente para dar estilo a los datos de las columnas
const StyleDataCell: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <span className={`text-[8px] md:text-[10px] text-center block ${className}`}>{children}</span>
  );
};

const dateFilterFn: FilterFn<DataTableCntsPorPagar> = (
  row,
  columnId,
  filterValue,
) => {
  const cellValue = row.getValue(columnId);
  if (!filterValue || filterValue === "") return true;

  if (!cellValue) return false;

  // Transformamos el valor de la celda al mismo formato visible "dd/mm/yyyy"
  const d = new Date(cellValue as string | Date);
  if (isNaN(d.getTime())) return false;

  const formattedCellDate = d.toLocaleDateString("es-PE", { timeZone: "UTC" });

  // Comparamos si lo que escribe el usuario está incluido en la fecha formateada
  return formattedCellDate
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const numericFilterFn: FilterFn<DataTableCntsPorPagar> = (
  row,
  columnId,
  filterValue,
) => {
  const cellValue = row.getValue(columnId);
  if (filterValue === "" || filterValue === undefined) return true;
  // Convertimos el número a string para permitir búsqueda parcial (ej: escribir "12" y que encuentre "120.50")
  return String(cellValue)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

function TablaMostrarCntPorCobrar() {
  // const year = new Date().getFullYear();
  // const [selectedYear, setSelectedYear] = useState<string>(year.toString())
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  const { data: years } = useYearsContabilidadVentas();

  const [columnFilters] = useState<ColumnFiltersState>([
    {
      id: "status_pago",
      value: "PENDIENTE",
    },
  ]);

  // 1. Obtención de datos desde la API
  const {
    data: apiData,
    isLoading,
    isError,
  } = useCuentasPorCobrarResumenMensualCaja(selectedYear);


  // 2. Mapeo y transformación profesional de Datos para Adaptar los Tipos
  const tableData = useMemo(() => {
    if (!apiData) return [];
    return mapDataTable(apiData);
  }, [apiData]);

  // Formateador auxiliar de Moneda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "PEN",
    }).format(amount);
  };

  // Formateador auxiliar de Fechas
  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("es-PE", { timeZone: "UTC" });
  };

  // 3. Definición de Columnas (apuntando a los nuevos campos mapeados)
  const columns = useMemo<ColumnDef<DataTableCntsPorPagar, any>[]>(
    () => [
      {
        accessorKey: "key",
        size: 70,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Nro.
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "fecha_emision",
        size: 100,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Emisión
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "fecha_vencimiento",
        size: 100,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Venc.
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "status_fecha",
        size: 100,
        // 🚀 Cambiado a text para que busque coincidencias de caracteres ("Vencido", "Faltan", "Hoy")
        filterFn: "includesString", 
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoStopwatchOutline  className="text-gray-500" /> Estado Venc.
          </span>
        ),
        cell: (info) => {
          const textoEstado = String(info.getValue());

          // Evaluamos el contenido del string para aplicar los colores de Tailwind
          if (textoEstado === "Completado") {
            return (
              <div className="flex justify-center">
                <span className="px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Completado
                </span>
              </div>
            );
          }

          if (textoEstado === "Vence Hoy") {
            return (
              <div className="flex justify-center">
                <span className="px-2 py-1 text-[8px] md:text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                  Vence Hoy
                </span>
              </div>
            );
          }

          if (textoEstado.startsWith("Faltan")) {
            return (
              <div className="flex justify-center">
                <span className="px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-green-50 text-green-700 border border-green-200">
                  {textoEstado}
                </span>
              </div>
            );
          }

          if (textoEstado.startsWith("Vencido")) {
            return (
              <div className="flex justify-center">
                <span className="px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
                  {textoEstado}
                </span>
              </div>
            );
          }

          // Caso de "Sin Fecha" o "Fecha Inválida"
          return (
            <div className="flex justify-center text-[8px] md:text-[10px] text-gray-400 italic">
              {textoEstado}
            </div>
          );
        },
      },
      {
        accessorKey: "nro_documento",
        size: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> RUC
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
      },
      {
        accessorKey: "cliente_razon_social",
        size: 300,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Cliente
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
        footer: () => (
          <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
            TOTAL:
          </span>
        ),
      },
      {
        accessorKey: "total",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Total
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {formatCurrency(info.getValue(), info.row.original.moneda)}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("total")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {new Intl.NumberFormat("es-PE", {
              }).format(totalFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "fecha_pago",
        size: 100,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Pago
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "monto_pagado",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> M. Pagado
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {formatCurrency(info.getValue(), info.row.original.moneda)}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalPagadoFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("monto_pagado")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {new Intl.NumberFormat("es-PE", {
              }).format(totalPagadoFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "status_pago",
        meta: { filterVariant: "select", textAlign: "left" },
        size: 100,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1 w-full justify-center">
            <IoCheckmarkCircleOutline className="text-gray-500" /> Cobro
          </span>
        ),
        cell: (info) => {
          const valorOriginal = info.getValue() || "PENDIENTE";
          const estado = valorOriginal.toLowerCase();

          const badgeStyles =
            estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : estado === "parcial"
                ? "bg-orange-300 text-orange-900"
                : estado === "cancelado"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-800";

          return (
            <span
              className={`flex items-center px-2 py-0.5 text-[8px] md:text-[10px] justify-center font-semibold rounded-md ${badgeStyles}`}
            >
              {valorOriginal}
            </span>
          );
        },
      },
      {
        accessorKey: "link_pdf",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoDocumentTextOutline className="text-gray-500" /> PDF
          </span>
        ),
        cell: (info) => (
          <div className="flex justify-center">
            <a href={info.getValue()} target="_blank" rel="noopener noreferrer">
              <IoDocumentTextOutline size={14} className="hover:text-red-700" />
            </a>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "monto_detraccion",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Detracción
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {info.getValue()}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalPagadoFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("monto_detraccion")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {new Intl.NumberFormat("es-PE", {
              }).format(totalPagadoFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "monto_retencion",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Retención
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {info.getValue()}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalPagadoFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("monto_retencion")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {new Intl.NumberFormat("es-PE", {
              }).format(totalPagadoFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "actions",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Acción
          </span>
        ),
        cell: (info) => (
          <div className="flex justify-center">
            <button
              className="px-1"
              onClick={() => {
                window.open(info.getValue(), "_blank");
              }}
            >
              click
            </button>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      }
    ],
    [],
  );

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando cuentas por pagar...
      </div>
    );
  if (isError)
    return <div className="p-6 text-center text-red-500">{isError}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-58px)] w-full gap-1">
      <header className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Control de Cuentas por Cobrar
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestión de derechos de cobros a clientes
          </p>
        </div>
        <div>
          <Select
            className="w-30"
            placeholder="Año"
            value={selectedYear}
            onChange={setSelectedYear}
            options={years?.map((y) => ({ value: y, label: y }))}
          />{" "}
        </div>
      </header>

      <main className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-auto w-full">
        <TableBaseFuzzyCntasPorCobrar<DataTableCntsPorPagar>
          data={tableData}
          columns={columns}
          fuzzyFilter={fuzzyFilter}
          columFiltersInitialValue={columnFilters}
        />
      </main>
      
    </div>
  );
}

export default TablaMostrarCntPorCobrar;
