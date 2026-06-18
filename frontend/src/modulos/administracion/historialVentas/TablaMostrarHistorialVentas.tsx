import React, { useMemo } from "react";
import {
  sortingFns,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { useHistorialVentasListaList } from "../../../api/queries/modulos/administracion/ventas/historial.api";
import type { HistorialVentasOutApiType } from "../../../api/queries/modulos/administracion/ventas/historial.api.schema";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoDocumentTextOutline,

} from "react-icons/io5";
import { SkeletonHeaderTable } from "../../../components/skeleton/SkeletonHeaderTable";
import { TableBaseFuzzyCntasPorCobrar } from "../../../components/tanstack-table/TablaBaseTsKFilterPaginacion";
import { ApiErrorDisplay } from "../../../components/Error/ApiErrorDisplay";

// --- INTERFACES Y MAPPERS ---

interface DataTable {
  key: number;
  id: number;
  fecha_emision: string | Date;
  tipo_cp_codigo: string;
  comprobante: string;
  base_imponible: number;
  igv: number;
  total: number;
  moneda: string;
  tipo_cambio: number;
  tipo_documento?: string;
  nro_documento?: string;
  razon_social?: string;
  categoria?: string;
  descripcion_comprobante?: string;
}

const mapHistorialVentasTable = (
  historialVentasData: HistorialVentasOutApiType[],
): DataTable[] => {
  return historialVentasData.map((item, index) => ({
    key: index + 1,
    id: item.id,
    fecha_emision: item.fecha_emision || "",
    tipo_cp_codigo: item.tipo_cp_codigo || "",
    comprobante: `${item.serie || ""}-${item.numero || ""}`,
    base_imponible: (item.base_imponible || 0) / (item.tipo_cambio || 1) || 0,
    igv: (item.igv || 0) / (item.tipo_cambio || 1) || 0,
    total: (item.total || 0) / (item.tipo_cambio || 1) || 0,
    moneda: item.moneda || "",
    tipo_cambio: item.tipo_cambio || 0,
    tipo_documento: item.tipo_documento || "",
    nro_documento: item.nro_documento || "",
    razon_social: item.razon_social || "",
    categoria: item.categoria || "",
    descripcion_comprobante: item.descripcion_comprobante || "",
  }));
};

const format = new Intl.NumberFormat("es-PE", {});

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "PEN",
  }).format(amount);
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

// --- FILTRO PERSONALIZADO PARA NÚMEROS ---
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};
const numericFilterFn: FilterFn<DataTable> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (filterValue === "" || filterValue === undefined) return true;
  // Convertimos el número a string para permitir búsqueda parcial (ej: escribir "12" y que encuentre "120.50")
  return String(cellValue)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const dateFilterFn: FilterFn<DataTable> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (!filterValue || filterValue === "") return true;

  if (!cellValue) return false;

  const d = new Date(cellValue as string | Date);
  if (isNaN(d.getTime())) return false;

  const formattedCellDate = d.toLocaleDateString("es-PE", { timeZone: "UTC" });

  return formattedCellDate
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

interface PropsComponent {
  children: React.ReactNode;
  className?: string;
}
// componente para dar estilo a los datos de las columnas
const StyleDataCell: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <span
      title={children?.toString().trim() || "-"}
      className={`text-[8px] md:text-[10px] text-center block ${className}`}
    >
      {children}
    </span>
  );
};

// Formateador auxiliar de Fechas
const formatDate = (date: string | Date | null) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("es-PE", { timeZone: "UTC" });
};

// --- COMPONENTE PRINCIPAL ---

export function HistorialVentasTable() {
  const [columnFilters] = React.useState<ColumnFiltersState>([]);

  const {
    data: apiData,
    isLoading,
    isError,
    error,
  } = useHistorialVentasListaList();

  const tableData = useMemo(() => {
    if (!apiData) return [];
    return mapHistorialVentasTable(apiData);
  }, [apiData]);

  const columns = React.useMemo<ColumnDef<DataTable, any>[]>(
    () => [
      {
        accessorKey: "key",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Nro.
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
        // Eliminamos equalsString si es un número correlativo secuencial
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
        accessorKey: "descripcion_comprobante",
        size: 300,
        minSize: 150,
        maxSize: 800,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoDocumentTextOutline className="text-gray-500" /> Descripción
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue() || "-"}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "razon_social",
        size: 250,
        minSize: 150,
        maxSize: 600,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Cliente
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue() || "-"}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "nro_documento",
        size: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> RUC/DNI
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue() || "-"}</StyleDataCell>,
        filterFn: "fuzzy",
      },
      {
        accessorKey: "categoria",
        size: 100,
        meta: { textAlign: "center", filterVariant: "select" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> Categoría
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue() || "-"}</StyleDataCell>,
        filterFn: "fuzzy",
      },
      {
        accessorKey: "tipo_cp_codigo",
        size: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> Tipo CP
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
        
      },
      {
        accessorKey: "comprobante",
        size: 100,
        minSize: 60,
        maxSize: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Comprobante
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-center">
            {info.getValue() || "-"}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
        footer: () => (
          <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
            TOTALES:
          </span>
        ),
      },
      {
        accessorKey: "base_imponible",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> B.I.
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
            .rows.reduce(
              (sum, row) => sum + (Number(row.getValue("base_imponible")) || 0),
              0,
            );

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {format.format(totalFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "igv",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> IGV
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
            .rows.reduce(
              (sum, row) => sum + (Number(row.getValue("igv")) || 0),
              0,
            );

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {format.format(totalFiltrado)}
            </span>
          );
        },
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
            .rows.reduce(
              (sum, row) => sum + (Number(row.getValue("total")) || 0),
              0,
            );

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {format.format(totalFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "moneda",
        size: 80,
        meta: { textAlign: "center", filterVariant: "select" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Moneda
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue() || "-"}</StyleDataCell>,
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
    ],
    [],
  );

  const columnsExcel = [
      {
        key: "key",
        header: "Nro.",
        width: 5,
      },
      {
        key: "fecha_emision",
        header: "F. Emisión",
        width: 15,
      },
      {
        key: "descripcion_comprobante",
        header: "Descripción",
        width: 50,
      },
      {
        key: "razon_social",
        header: "Cliente",
        width: 20,
      },
      {
        key: "nro_documento",
        header: "RUC/DNI",
        width: 20,
      },
      {
        key: "categoria",
        header: "Categoría",
        width: 10,
      },
      {
        key: "tipo_cp_codigo",
        header: "Tipo CP",
        width: 5,
      },
      {
        key: "comprobante",
        header: "Comprobante",
        width: 10,
      },
      {
        key: "base_imponible",
        header: "B.I.",
        width: 10,
      },
      {
        key: "igv",
        header: "IGV",
        width: 10,
      },
      {
        key: "total",
        header: "Total",
        width: 10,
      },
      {
        key: "moneda",
        header: "Moneda",
        width: 10,
      },
      
    ];
  if (isLoading) return <SkeletonHeaderTable loading={isLoading} />;

  if (isError) return <ApiErrorDisplay error={error} />;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-58px)] gap-3">
      <header className="px-2 flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-mist-50 tracking-tight">
            Historial de Ventas
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Todas las ventas realizadas por la empresa desde el 2018
          </p>
        </div>

        <div className="flex flex-row items-center gap-2"></div>
      </header>

      <main className="flex-1 overflow-auto w-full">
        <TableBaseFuzzyCntasPorCobrar<DataTable>
          data={tableData}
          columns={columns}
          fuzzyFilter={fuzzyFilter}
          columFiltersInitialValue={columnFilters}
          cantidadFilas={20}
          excelFileName="HistorialVentas"
          columnsExcel={columnsExcel}
        />
      </main>
    </div>
  );
}
