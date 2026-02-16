import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table";
import { Empty, Card, Typography, Skeleton } from "antd";
import { useHistorialVentasListaList } from "../../../api/queries/modulos/administracion/ventas/historialVentas.api";
import type { HistorialVentasOutApiType } from "../../../api/queries/modulos/administracion/ventas/historialVentas.api.schema";
import { useToggle } from "../../../hooks/Toggle";
import ButtomNew from "../../../components/molecules/botons/BottomNew";
import HistorialVentasImportMasiva from "./ModalImportacionMasivaHV";
import isoToDDMMYYYY from "../../../helpers/Fechas";

const { Text } = Typography;

// --- INTERFACES Y MAPPERS ---

interface DataTable {
  id: number;
  fecha: string;
  descripcion: string;
  categoria: string;
  ruc: string;
  cliente: string;
  tipo: string;
  serie: string;
  numero: string;
  subtotal: number;
  igv: number;
  total: number;
  tc: number;
}

const mapHistorialVentasTable = (historialVentasData: HistorialVentasOutApiType[]): DataTable[] => {
  return historialVentasData.map((w, i) => ({
    id: i + 1,
    fecha: isoToDDMMYYYY(w.fecha) ?? "-",
    descripcion: w.descripcion ?? "-",
    categoria: w.categoria ?? "-",
    ruc: w.ruc ?? "-",
    cliente: w.cliente ?? "-",
    tipo: w.tipo ?? "-",
    serie: w.serie ?? "-",
    numero: String(w.numero) ?? "-",
    subtotal: Number(w.subtotal) || 0,
    igv: Number(w.igv) || 0,
    total: Number(w.total) || 0,
    tc: Number(w.tc) || 0,
  }));
};

// --- FILTRO PERSONALIZADO PARA NÚMEROS ---

const numericFilterFn: FilterFn<DataTable> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
  if (filterValue === "" || filterValue === undefined) return true;
  // Convertimos el número a string para permitir búsqueda parcial (ej: escribir "12" y que encuentre "120.50")
  return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase());
};

// --- COMPONENTE PRINCIPAL ---

export function HistorialVentasTable() {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const openModal = useToggle();

  const { data: sales = [], isLoading, isError, error } = useHistorialVentasListaList();

  const dataSource = useMemo(() => {
    if (!sales) return [];
    return mapHistorialVentasTable(sales);
  }, [sales]);

  const columns = React.useMemo<ColumnDef<DataTable, any>[]>(
    () => [
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => <Text style={{ fontSize: "10px" }} className="text-gray-600">{info.getValue()}</Text>,
        size: 80,
        meta: { textAlign: "center" },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => (
          <Text style={{ fontSize: "10px" }} ellipsis={{ tooltip: info.getValue() }} className="text-gray-600">
            {info.getValue()}
          </Text>
        ),
        size: 220,
        meta: { textAlign: "left" },
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        cell: (info) => (
          <Text style={{ fontSize: "10px" }} ellipsis={{ tooltip: info.getValue() }} className="text-gray-600">
            {info.getValue()}
          </Text>
        ),
        size: 180,
        meta: { textAlign: "left" },
      },
      {
        accessorKey: "ruc",
        header: "RUC",
        size: 100,
        cell: (info) => <Text style={{ fontSize: "10px" }}>{info.getValue()}</Text>,
        meta: { textAlign: "center" },
      },
      {
        accessorKey: "categoria",
        header: "Categoría",
        size: 90,
        meta: { filterVariant: "select", textAlign: "left" },
        cell: (info) => <Text style={{ fontSize: "10px" }}>{info.getValue().toUpperCase()}</Text>,
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        size: 60,
        meta: { filterVariant: "select", textAlign: "center" },
        cell: (info) => <Text style={{ fontSize: "10px" }}>{info.getValue()}</Text>,
      },
      {
        accessorKey: "serie",
        header: "Serie",
        size: 70,
        meta: { textAlign: "center" },
        cell: (info) => <Text style={{ fontSize: "10px" }}>{info.getValue()}</Text>,
      },
      {
        accessorKey: "numero",
        header: "Número",
        size: 70,
        meta: { textAlign: "center" },
        cell: (info) => <Text style={{ fontSize: "10px" }}>{info.getValue()}</Text>,
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        size: 80,
        filterFn: numericFilterFn, // Aplicación del filtro
        meta: { filterVariant: "inputnumber", textAlign: "right" },
        cell: (info) => (
          <Text style={{ fontSize: "10px" }} className="text-gray-600">
            {info.getValue().toFixed(2)}
          </Text>
        ),
      },
      {
        accessorKey: "igv",
        header: "IGV",
        size: 80,
        filterFn: numericFilterFn, // Aplicación del filtro
        meta: { filterVariant: "inputnumber", textAlign: "right" },
        cell: (info) => (
          <Text style={{ fontSize: "10px" }} className="text-gray-600">
            {info.getValue().toFixed(2)}
          </Text>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 110,
        filterFn: numericFilterFn, // Aplicación del filtro
        meta: { filterVariant: "inputnumber", textAlign: "right" },
        cell: (info) => (
          <Text style={{ fontSize: "10px", fontWeight: "bold" }}>
            {info.getValue().toFixed(2)}
          </Text>
        ),
      },
      {
        accessorKey: "tc",
        header: "TC",
        size: 50,
        filterFn: numericFilterFn, // Aplicación del filtro
        meta: { filterVariant: "inputnumber", textAlign: "center" },
        cell: (info) => (
          <Text style={{ fontSize: "10px" }} className="text-gray-600">
            {info.getValue().toFixed(3)}
          </Text>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: dataSource,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: 15 }
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Skeleton active paragraph={{ rows: 20 }} /></div>;
  if (isError) return <Card className="m-4 border-red-200 bg-red-50 text-red-600">Error: {(error as any)?.message}</Card>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Historial de Ventas 2018 - 2025</h2>
          <p className="text-[10px] text-gray-400 font-medium uppercase">Total: {dataSource.length}</p>
        </div>
        <div className="flex gap-2">
          <ButtomNew onClick={openModal.toggle} />
          <HistorialVentasImportMasiva open={openModal.isToggled} onClose={openModal.setOff} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="w-full border-collapse text-sm table-fixed min-w-[1100px]">
          <thead className="bg-gray-50 text-gray-900 uppercase text-[10px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = (header.column.columnDef.meta as any)?.textAlign || "left";
                  return (
                    <th key={header.id} className="p-3 border-b font-bold" style={{ width: header.getSize() }}>
                      <div
                        className={`flex items-center gap-1 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"} ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-pink-600" : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() && (
                        <div className="mt-2 font-normal lowercase">
                          <Filter column={header.column} />
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="dark:hover:bg-blue-50/20 hover:bg-slate-200 transition-all">
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as any)?.textAlign || "left";
                    return (
                      <td
                        key={cell.id}
                        className="p-2 whitespace-nowrap overflow-hidden"
                        style={{ textAlign: align as any, width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hay registros" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-2 border rounded-lg">
        <div className="flex gap-1">
          <button className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-teal-400 cursor-pointer" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</button>
          <button className="px-3 py-1 border rounded text-xs disabled:opacity-30 hover:bg-teal-400 cursor-pointer" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</button>
        </div>
        <div className="text-[11px] font-bold text-gray-400">
          Pág. <span className="text-blue-600">{table.getState().pagination.pageIndex + 1}</span> de {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE FILTRO ---

function Filter({ column }: { column: Column<any, unknown> }) {
  const { filterVariant } = (column.columnDef.meta as any) ?? {};
  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = React.useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  const inputStyle = "border border-gray-400 rounded px-2 py-1 text-[9px] w-full bg-white outline-none focus:border-blue-300 transition-all";

  if (filterVariant === "select") {
    return (
      <select
        onChange={(e) => column.setFilterValue(e.target.value)}
        value={columnFilterValue?.toString() || ""}
        className={inputStyle}
      >
        <option value="">TODOS</option>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value?.toString() ?? "null"}>
            {String(value).toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  // Para números usamos texto para facilitar la escritura de decimales y el filtrado por "contains"
  return (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="FILTRAR..."
      className={inputStyle}
    />
  );
}