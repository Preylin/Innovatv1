import { useEffect, useState } from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type RankingInfo } from "@tanstack/match-sorter-utils";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  fuzzyFilter: FilterFn<any>;
}

export function TableBaseFuzzyCntasPorPagar<T>({
  data,
  columns,
  fuzzyFilter,
}: Props<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  // Aplica ordenamiento automático si se está filtrando por la columna principal (Proveedor)
  useEffect(() => {
    const firstFilterId = table.getState().columnFilters[0]?.id;
    if (firstFilterId === "proveedor_razon_social") {
      if (table.getState().sorting[0]?.id !== "proveedor_razon_social") {
        table.setSorting([{ id: "proveedor_razon_social", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="p-4 flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 text-sm shadow-sm border border-gray-300 rounded-lg w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar en todas las columnas..."
        />
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {table.getPrePaginationRowModel().rows.length} Registros Encontrados
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="p-3" key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div className="flex flex-col gap-1">
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none hover:text-gray-900"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div className="mt-1">
                            <Filter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr className="hover:bg-gray-50 transition-colors" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="p-3 whitespace-nowrap" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="text-sm text-gray-600">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
            de <strong>{table.getPageCount()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-gray-600">
            Ir a:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border border-gray-300 p-1 rounded-md w-16 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </span>
          <select
            className="border border-gray-300 p-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Filtrar..."
      className="w-full p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
