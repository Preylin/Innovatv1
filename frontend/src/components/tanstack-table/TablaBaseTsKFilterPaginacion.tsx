import { useCallback, useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
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

// Componentes shadcn/ui originales
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Inbox,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface ColumnExcel {
  header: string;
  key: string;
  width: number;
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  fuzzyFilter: FilterFn<any>;
  columFiltersInitialValue?: ColumnFiltersState;
  cantidadFilas?: number;
  excelFileName?: string;
  columnsExcel: ColumnExcel[];
}

export function TableBaseFuzzyCntasPorCobrar<T>({
  data,
  columns,
  fuzzyFilter,
  columFiltersInitialValue,
  cantidadFilas = 15,
  excelFileName = "Export",
  columnsExcel,
}: Props<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    columFiltersInitialValue ?? [],
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: cantidadFilas,
  });

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { columnFilters, globalFilter, pagination },
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
  });

  const handleExportExcel = useCallback(async () => {
    const filteredRows = table.getFilteredRowModel().rows;
    if (filteredRows.length === 0) {
      alert("No hay registros en la tabla para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    worksheet.columns = columnsExcel.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1e293b" },
    };

    const validExcelKeys = new Set(columnsExcel.map((col) => col.key));

    filteredRows.forEach((row) => {
      const item = row.original;
      const excelRow = worksheet.addRow({ ...item });

      ["base_imponible", "igv", "total"].forEach((key) => {
        if (validExcelKeys.has(key)) {
          const cell = excelRow.getCell(key);
          if (cell && cell.value !== undefined && cell.value !== null) {
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right" };
          }
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${excelFileName}_${timestamp}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [table, columnsExcel, excelFileName]);

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === "fullName") {
      if (table.getState().sorting[0]?.id !== "fullName") {
        table.setSorting([{ id: "fullName", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="px-2 flex flex-col gap-2 w-full animate-in fade-in duration-500">
      {/* Barra superior */}
      <div className="flex flex-row justify-between items-center gap-4 py-1 w-full">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Buscar en todas las columnas..."
          className="w-full text-mist-900 dark:text-mist-50"
        />

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-sm font-normal p-3 bg-mist-600 text-mist-50 whitespace-nowrap"
          >
            {table.getPrePaginationRowModel().rows.length} Registros
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            title="Exportar Excel"
            className="gap-2 text-mist-900 dark:text-mist-50"
          >
            <FileSpreadsheet className="h-4 w-4 " />
            Exportar
          </Button>
        </div>
      </div>

      {/* Contenedor de la Tabla Flex */}
      <div className="rounded-md border shadow-sm overflow-auto w-full bg-background">
        <div className="flex flex-col w-full min-w-full">
          {/* HEADER */}
          <div className="flex flex-col w-full bg-mist-600 font-bold uppercase text-xs text-mist-50 tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex w-full items-stretch">
                {headerGroup.headers.map((header) => {
                  const align =
                    (header.column.columnDef.meta as any)?.textAlign || "left";
                  return (
                    <div
                      key={header.id}
                      style={{
                        flex: `${header.getSize()} ${header.getSize()} 0%`,
                        minWidth: `${header.getSize()}px`,
                      }}
                      className="relative p-2 flex flex-col justify-between border-r border-mist-500/20 last:border-0"
                    >
                      <div
                        className={`flex items-center gap-1 w-full ${
                          align === "center"
                            ? "justify-center text-center"
                            : align === "right"
                              ? "justify-end text-right"
                              : "justify-start text-left"
                        } ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-primary-foreground/80" : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>

                      {header.column.getCanFilter() && (
                        <div className="mt-2 font-normal lowercase w-full">
                          <Filter column={header.column} />
                        </div>
                      )}

                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none z-10 hover:bg-muted-foreground/20 ${
                            header.column.getIsResizing()
                              ? "bg-primary w-2"
                              : "bg-transparent"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* CUERPO */}
          <div className="flex flex-col w-full divide-y bg-mist-50">
            {table.getRowModel().rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground w-full">
                <Inbox className="h-10 w-10" />
                <span>No hay registros</span>
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex w-full hover:bg-mist-200 transition-colors items-stretch"
                >
                  {row.getVisibleCells().map((cell) => {
                    const align =
                      (cell.column.columnDef.meta as any)?.textAlign || "left";
                    return (
                      <div
                        key={cell.id}
                        style={{
                          flex: `${cell.column.getSize()} ${cell.column.getSize()} 0%`,
                          minWidth: `${cell.column.getSize()}px`,
                        }}
                        className={`p-2 truncate flex items-center border-r last:border-0 border-muted/30 ${
                          align === "center"
                            ? "justify-center text-center"
                            : align === "right"
                              ? "justify-end text-right"
                              : "justify-start text-left"
                        }`}
                      >
                        <div className="truncate w-full">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
          {/* FOOTER */}
          {table.getFooterGroups().length > 0 && (
            <div className="flex flex-col w-full border-t border-muted bg-mist-100 font-semibold text-xs text-mist-900">
              {table.getFooterGroups().map((footerGroup) => (
                <div key={footerGroup.id} className="flex w-full items-stretch">
                  {footerGroup.headers.map((footer) => {
                    const align =
                      (footer.column.columnDef.meta as any)?.textAlign ||
                      "left";
                    return (
                      <div
                        key={footer.id}
                        style={{
                          flex: `${footer.column.getSize()} ${footer.column.getSize()} 0%`,
                          minWidth: `${footer.column.getSize()}px`,
                        }}
                        className={`p-2 flex items-center border-r last:border-0 border-muted/30 ${
                          align === "center"
                            ? "justify-center text-center"
                            : align === "right"
                              ? "justify-end text-right"
                              : "justify-start text-left"
                        }`}
                      >
                        <div className="truncate w-full">
                          {footer.isPlaceholder
                            ? null
                            : flexRender(
                                footer.column.columnDef.footer,
                                footer.getContext(),
                              )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
            de <strong>{table.getPageCount()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            Ir a:
            <Input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16 h-8 text-center text-mist-600"
            />
          </span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-36 h-8 text-mist-900 dark:text-mist-50">
              <SelectValue placeholder="Filas" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground dark:text-mist-50">
              {[15, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  Mostrar {pageSize} filas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

  if (filterVariant === "select") {
    return (
      <Select
        value={columnFilterValue?.toString() || ""}
        onValueChange={(value) => column.setFilterValue(value)}
      >
        <SelectTrigger
          className=" rounded-sm text-[10px] w-full bg-background text-foreground"
          size="sm"
        >
          <SelectValue placeholder="TODOS" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">TODOS</SelectItem>
          {sortedUniqueValues.map((value: any) => (
            <SelectItem key={value} value={value}>
              {String(value).toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <DebouncedInput
      type="search"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Filtrar..."
      className="h-7 rounded-sm text-[10px] w-full bg-background text-foreground"
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 400,
  className,
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

  return (
    <Input
      type="search"
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}
