import { useEffect, useMemo, useState } from "react";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { type RankingInfo } from "@tanstack/match-sorter-utils";
import { Empty } from "antd";

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
  columFiltersInitialValue?: ColumnFiltersState;
  cantidadFilas?: number;
}

export function TableBaseFuzzyCntasPorCobrar<T>({
  data,
  columns,
  fuzzyFilter,
  columFiltersInitialValue,
  cantidadFilas = 15,
}: Props<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(columFiltersInitialValue ?? []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: cantidadFilas,
  });

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    columnResizeMode: "onChange",
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === "fullName") {
      if (table.getState().sorting[0]?.id !== "fullName") {
        table.setSorting([{ id: "fullName", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="px-2 flex flex-col gap-2 w-full animate-in fade-in duration-500">
      <div className="flex flex-row sm:flex-row justify-between items-center sm:items-center gap-6 w-full py-0.5">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 text-sm shadow-md shadow-mist-300 border border-mist-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-olive-500 dark:text-mist-50 dark:shadow-mist-500"
          placeholder="Buscar en todas las columnas..."
        />
        <div className="text-sm font-medium text-mist-50 bg-mist-500 shadow-md shadow-mist-400 dark:shadow-mist-600 px-2 py-1 rounded-md text-center w-40">
          {table.getPrePaginationRowModel().rows.length} Registros
        </div>
      </div>

      <div className="shadow-md shadow-mist-400 overflow-auto rounded-md w-full">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead className="text-xs text-mist-50 font-semibold uppercase tracking-wider bg-mist-600 border-x border-mist-600 text-center">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = (header.column.columnDef.meta as any)?.textAlign || "left";
                  return (
                    <th
                      key={header.id}
                      className="px-2 py-1 relative group select-none"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className={`flex items-center gap-1 ${
                          align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
                        } ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-pink-600" : ""}`}
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

                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none z-10 hover:bg-mist-400 ${
                              header.column.getIsResizing() ? "bg-blue-600 w-2" : "bg-transparent"
                            }`,
                          }}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-mist-50 divide-y divide-gray-200 text-sm text-mist-950">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hay registros" />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr className="hover:bg-mist-200/80" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="p-2 border border-gray-200 truncate"
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-mist-200 font-bold border-t-2 border-mist-400 text-sm sticky bottom-0">
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((footer) => {
                  const align = (footer.column.columnDef.meta as any)?.textAlign || "left";
                  return (
                    <td
                      key={footer.id}
                      className="p-2"
                      style={{ width: footer.column.getSize() }}
                    >
                      <div
                        className={`flex items-center w-full ${
                          align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(footer.column.columnDef.footer, footer.getContext())}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 px-2 border-t border-mist-100">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-0.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="px-2 py-0.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="px-2 py-0.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="px-2 py-0.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="text-[8px] md:text-[10px] text-mist-600 dark:text-mist-50">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de <strong>{table.getPageCount()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-[8px] md:text-[10px] text-mist-600 dark:text-mist-50">
            Ir a:
            <input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border border-gray-300 p-1 rounded-md w-16 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </span>
          <select
            className="border border-gray-300 p-1.5 rounded-md text-[8px] md:text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[15, 20, 25, 30, 40, 50].map((pageSize) => (
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
  const { filterVariant } = (column.columnDef.meta as any) ?? {};
  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()],
  );

  const inputStyle =
    "w-full p-1 text-[8px] md:text-[10px] text-mist-500 font-bold border border-mist-300 rounded focus:outline-none focus:ring-1 bg-white focus:ring-teal-600";

  if (filterVariant === "select") {
    return (
      <select
        onChange={(e) => column.setFilterValue(e.target.value)}
        value={columnFilterValue?.toString() || ""}
        className={inputStyle}
      >
        <option value="">TODOS</option>
        {sortedUniqueValues.map((value: any) => (
          <option key={value} value={value}>
            {String(value).toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Filtrar..."
      className={inputStyle}
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
  }, [value]);

  return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}