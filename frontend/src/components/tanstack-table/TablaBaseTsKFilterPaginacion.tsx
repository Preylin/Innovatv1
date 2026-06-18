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

// Componentes shadcn/ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Inbox, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
      <div className="flex flex-row justify-between items-stretch sm:items-center gap-4 py-1 w-full">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Buscar en todas las columnas..."
          className="w-full "
        />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm font-normal px-3 py-1 bg-mist-600 text-mist-50">
            {table.getPrePaginationRowModel().rows.length} Registros
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            title="Exportar Excel"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border shadow-sm overflow-auto">
        <Table>
          <TableHeader
          className=" font-bold uppercase bg-mist-600"
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const align =
                    (header.column.columnDef.meta as any)?.textAlign || "left";
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={`relative group text-mist-50 py-1 select-none ${
                        align === "center"
                          ? "text-center"
                          : align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1 ${
                          align === "center"
                            ? "justify-center"
                            : align === "right"
                            ? "justify-end"
                            : "justify-start"
                        } ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-primary"
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

                      {header.column.getCanFilter() && (
                        <div className="mt-2 font-normal">
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
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
          className=""
          >
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Inbox className="h-10 w-10" />
                    <span>No hay registros</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="truncate"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {table.getFooterGroups().length > 0 && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    const align =
                      (footer.column.columnDef.meta as any)?.textAlign || "left";
                    return (
                      <TableCell
                        key={footer.id}
                        style={{ width: footer.column.getSize() }}
                        className={
                          align === "center"
                            ? "text-center"
                            : align === "right"
                            ? "text-right"
                            : "text-left"
                        }
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                              footer.column.columnDef.footer,
                              footer.getContext(),
                            )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
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
          <span className="text-sm text-muted-foreground ml-2">
            Página{" "}
            <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
            <strong>{table.getPageCount()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            Ir a:
            <Input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-20 h-8 text-center text-mist-600"
            />
          </span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-36 h-8 ">
              <SelectValue placeholder="Filas" />
            </SelectTrigger>
            <SelectContent
            className="bg-mist-50 text-mist-600"
            >
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

// ---------- Subcomponentes sin cambios de lógica, solo maquetación ----------
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
        <SelectTrigger className="h-7 text-xs w-full bg-mist-50 text-mist-600">
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
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder="Filtrar..."
      className="h-7 text-xs w-full bg-mist-50 text-mist-600"
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
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}