import "react-data-grid/lib/styles.css";
import {
  DataGrid,
  type Column,
  type SortColumn,
  type RowsChangeData,
  type DataGridHandle,
} from "react-data-grid";
import { Button, message, Skeleton, Tooltip } from "antd";
import dayjs from "dayjs";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import ExcelJS from "exceljs";
import { FaCaretDown } from "react-icons/fa";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";
import DataChangeManagerCompras from "../types/DataChangeManagerVentas";

export type Filters = Record<string, string>;

interface ColumnExcel {
  header: string;
  key: string;
  width: number;
}

interface BaseRow {
  id: number;
  key: number;
}

interface Props<T extends BaseRow> {
  data: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
  totalBaseImponible: number;
  totalIgv: number;
  totalNoGravadas: number;
  totalOtros: number;
  totalTotal: number;
  excelFileName?: string;
  moneda: string;
  mapDataApi: (data: any[]) => T[];
  syncData: (payload: { created: T[]; updates: T[] }) => Promise<void>;
  deleteItems: (ids: number[]) => Promise<void>;
  getColumns: (
    updateCell: (rowId: number, field: keyof T, value: any) => void,
    filters: Filters,
    setFilters: React.Dispatch<React.SetStateAction<Filters>>,
  ) => readonly Column<T>[];
  createEmptyRow: (id: number) => T;
  rowProcessor?: (rows: T[], apiData: T[]) => T[];
  columnsExcel: ColumnExcel[];
}

function TablaGridBaseCompras<T extends BaseRow>({
  data,
  isLoading,
  isError,
  totalBaseImponible,
  totalIgv,
  totalNoGravadas,
  totalOtros,
  totalTotal,
  excelFileName = "Export",
  moneda,
  mapDataApi,
  syncData,
  deleteItems,
  getColumns,
  createEmptyRow,
  rowProcessor,
  columnsExcel,
}: Props<T>) {
  const gridRef = useRef<DataGridHandle>(null);
  const [rows, setRows] = useState<T[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [activeCell, setActiveCell] = useState<{
    rowIdx: number;
    colIdx: number;
  } | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const changeManager = useRef(new DataChangeManagerCompras<T>([]));

  const apiData = useMemo(
    () => (data ? mapDataApi(data) : []),
    [data, mapDataApi],
  );

  // --- Sincronización Inicial y Control de renders concurrentes ---
  useEffect(() => {
    // PROTECCIÓN: Si se está ejecutando la mutación asíncrona, congelamos este efecto
    // para evitar que re-instancie el mánager y destruya el mapa interno de cambios.
    if (isSaving) return;

    if (apiData) {
      changeManager.current = new DataChangeManagerCompras<T>(apiData);

      // Asignamos un ID temporal inicial negativo a la fila en blanco por defecto
      // para blindar el flujo contra colisiones con IDs autoincrementales reales de la BD
      setRows([...apiData, createEmptyRow(-1)]);
      setHasChanges(false);
    }
  }, [apiData, createEmptyRow, isSaving]);

  // --- Lógica de Actualización de Celdas de forma manual ---
  const updateCell = useCallback(
    (rowId: number, field: keyof T, value: any) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id === rowId) {
            const updated = { ...r, [field]: value };
            // Un registro es verdaderamente "Nuevo" si su ID no existe en la data original de la API
            const isNew = !apiData?.some((apiR) => apiR.id === rowId);

            changeManager.current.registerChange(rowId, updated, isNew);
            setHasChanges(changeManager.current.hasChanges());
            return updated;
          }
          return r;
        }),
      );
    },
    [apiData],
  );

  const columns = useMemo(
    () => getColumns(updateCell, filters, setFilters),
    [getColumns, updateCell, filters],
  );

  // Bloqueo de salida involuntaria del navegador si hay cambios
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // --- Manejo del Guardado (Mutación del Payload) ---
  const handlerSave = async () => {
    if (!changeManager.current.hasChanges()) {
      return message.info("No hay cambios pendientes");
    }

    // 1. Extraemos el payload de forma síncrona ANTES de gatillar mutaciones de estado en React
    const pending = changeManager.current.getPendingPayload();
    setIsSaving(true);

    try {
      // 2. Enviamos el clon aislado de los datos directamente al Hook / Backend
      await syncData(pending);
      message.success("Datos guardados correctamente");

      // 3. Limpiamos el administrador solo tras una respuesta HTTP exitosa
      changeManager.current.clear();
      setHasChanges(false);
    } catch (error) {
      message.error("Error al sincronizar con el servidor");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSortedRows = useMemo(() => {
    let baseRows = [...rows];

    if (Object.keys(filters).length > 0) {
      baseRows = baseRows.filter((row) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const cellValue = row[key as keyof T];
          return String(cellValue ?? "")
            .toLowerCase()
            .includes(value.toLowerCase());
        }),
      );
    }

    if (sortColumns.length > 0) {
      baseRows.sort((a, b) => {
        for (const { columnKey, direction } of sortColumns) {
          const aVal = a[columnKey as keyof T] ?? "";
          const bVal = b[columnKey as keyof T] ?? "";
          if (aVal !== bVal) {
            const res = aVal < bVal ? -1 : 1;
            return direction === "ASC" ? res : -res;
          }
        }
        return 0;
      });
    }

    return rowProcessor ? rowProcessor(baseRows, apiData) : baseRows;
  }, [rows, sortColumns, filters, apiData, rowProcessor]);

  // --- Lógica del input de celdas nativas en DataGrid ---
  const handleRowsChange = useCallback(
    (newRows: T[], data: RowsChangeData<T>) => {
      const updatedRows = [...newRows];

      data.indexes.forEach((index) => {
        const updatedRow = updatedRows[index];
        const isNew = !apiData.some((apiR) => apiR.id === updatedRow.id);
        changeManager.current.registerChange(updatedRow.id, updatedRow, isNew);
      });

      setHasChanges(changeManager.current.hasChanges());

      const lastRow = updatedRows[updatedRows.length - 1];
      const isEditingLastRow = data.indexes.includes(updatedRows.length - 1);

      if (isEditingLastRow) {
        const hasData = Object.entries(lastRow).some(
          ([k, v]) =>
            !["id", "key"].includes(k) && v !== "" && v !== 0 && v !== null,
        );
        if (hasData) {
          // Generamos una clave de ID auto-incremental negativa y única para la fila vacía subsiguiente
          const nextTempId = Math.min(...updatedRows.map((r) => r.id), 0) - 1;
          updatedRows.push(createEmptyRow(nextTempId));
        }
      }
      setRows(updatedRows);
    },
    [apiData, createEmptyRow],
  );

  const cleanNumericValue = (
    value: string | number | null | undefined,
  ): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return isNaN(value) ? 0 : value;

    let clean = value
      .toString()
      .replace(/[S/$/\s]/g, "")
      .trim();
    if (!clean) return 0;

    const isParenthesisNegative = clean.startsWith("(") && clean.endsWith(")");
    if (isParenthesisNegative) clean = clean.replace(/[()]/g, "");

    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");

    if (lastComma > lastDot) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > lastComma) {
      clean = clean.replace(/,/g, "");
    } else if (lastComma !== -1 && lastDot === -1) {
      clean = clean.replace(",", ".");
    }

    let num = parseFloat(clean);
    if (isParenthesisNegative && num > 0) num *= -1;

    return isNaN(num) ? 0 : num;
  };

  // --- Lógica Avanzada de Pegado Masivo ---
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();

      const text = event.clipboardData.getData("text/plain");
      if (!text || !activeCell) return;

      const gridData = text
        .split(/\r?\n/)
        .filter((r) => r.trim().length > 0)
        .map((r) => r.split("\t"));

      setRows((currentRows) => {
        const rowsMap = new Map(currentRows.map((r) => [r.id, { ...r }]));
        const startRowIdx = activeCell.rowIdx;
        const startColIdx = activeCell.colIdx;

        const availableVisibleRows = filteredSortedRows.length - startRowIdx;
        const rowsToCreate = Math.max(
          0,
          gridData.length - availableVisibleRows,
        );

        // Generamos filas nuevas asignando IDs temporales estrictamente negativos
        if (rowsToCreate > 0) {
          let currentMinId = Math.min(...currentRows.map((r) => r.id), 0);
          for (let i = 1; i <= rowsToCreate; i++) {
            const newRow = createEmptyRow(currentMinId - i);
            rowsMap.set(newRow.id, newRow);
          }
        }

        const currentVisualIds = filteredSortedRows.map((r) => r.id);
        const allRowsInMap = Array.from(rowsMap.values());
        const newIds = allRowsInMap
          .map((r) => r.id)
          .filter((id) => !currentVisualIds.includes(id))
          .slice(-rowsToCreate);

        const combinedIds = [...currentVisualIds, ...newIds];

        gridData.forEach((rowData, i: number) => {
          const targetRowId = combinedIds[startRowIdx + i];
          if (targetRowId === undefined) return;

          const rowToUpdate = rowsMap.get(targetRowId);
          if (!rowToUpdate) return;

          rowData.forEach((value, j: number) => {
            const colIndex = startColIdx + j;
            const column = columns[colIndex];

            if (column && column.editable && column.key !== "select") {
              const rawValue = value.trim();
              const key = column.key as keyof typeof rowToUpdate;

              const numericKeys = [
                "base_imponible",
                "igv",
                "total",
                "tipo_cambio",
                "ingreso",
                "egreso",
              ];
              const dateKeys = [
                "fecha_inicio",
                "fecha_fin",
                "fecha_emision",
                "fecha_vencimiento",
              ];

              if (numericKeys.includes(column.key)) {
                (rowToUpdate as any)[key] = cleanNumericValue(rawValue);
              } else if (dateKeys.includes(column.key)) {
                if (!rawValue) {
                  (rowToUpdate as any)[key] =
                    column.key === "fecha_fin" ||
                    column.key === "fecha_vencimiento"
                      ? null
                      : "";
                } else {
                  const parsedDate = dayjs(rawValue, [
                    "DD/MM/YYYY",
                    "YYYY-MM-DD",
                    "DD-MM-YYYY",
                    "MM/DD/YYYY",
                    "DD/MM/YY",
                    "DD/MM/YYYY HH:mm:ss",
                  ]);
                  (rowToUpdate as any)[key] = parsedDate.isValid()
                    ? parsedDate.format("YYYY-MM-DD")
                    : null;
                }
              } else {
                (rowToUpdate as any)[key] = rawValue;
              }
            }
          });

          const isNew = !apiData?.some((apiR) => apiR.id === rowToUpdate.id);
          changeManager.current.registerChange(targetRowId, rowToUpdate, isNew);
          rowsMap.set(targetRowId, rowToUpdate);
        });

        setHasChanges(changeManager.current.hasChanges());
        return Array.from(rowsMap.values());
      });

      message.success("Datos pegados y normalizados");
    },
    [activeCell, apiData, columns, filteredSortedRows, createEmptyRow],
  );

  const handleDelete = async () => {
    if (selectedRows.size === 0) return;
    if (!confirm(`¿Estás seguro de eliminar ${selectedRows.size} registros?`))
      return;

    const idsToDelete = Array.from(selectedRows);
    try {
      await deleteItems(idsToDelete);
      setRows((prevRows) =>
        prevRows.filter((row) => !selectedRows.has(row.id)),
      );
      setSelectedRows(new Set());
      message.success("Registros eliminados de forma optimista");
    } catch (error) {
      message.error("No se pudieron eliminar los registros.");
    }
  };

  const handleExportExcel = useCallback(async () => {
    if (selectedRows.size === 0)
      return message.warning("Selecciona filas para exportar");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ventas");

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

    const dataToExport = rows.filter((row) => selectedRows.has(row.id));
    const formatStr = `"${moneda}" #,##0.00`;

    dataToExport.forEach((item) => {
      const row = worksheet.addRow({ ...item });
      ["base_imponible", "igv", "total"].forEach((key) => {
        const cell = row.getCell(key);
        cell.numFmt = formatStr;
        cell.alignment = { horizontal: "right" };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${excelFileName}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [selectedRows, rows, excelFileName, moneda]);

  const scrollToBottom = useCallback(() => {
    gridRef.current?.scrollToCell({ rowIdx: filteredSortedRows.length - 1 });
  }, [filteredSortedRows.length]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 15 }} />;
  if (isError || !data) return <ErrorResultServer />;

  return (
    <div
      className="flex flex-col gap-2 p-1 h-[calc(100vh-140px)] min-w-200 md:w-full"
      onPaste={handlePaste}
    >
      <header className="flex justify-between items-center px-2">
        <div className="flex gap-2">
          <div className="shadow-md shadow-mist-500 px-2 rounded-md bg-mist-500 text-mist-50">
            <span className="font-semibold">Base Imponible: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalBaseImponible)}
            </span>
          </div>
          <div className="shadow-md shadow-mist-500 px-2 rounded-md bg-mist-500 text-mist-50">
            <span className="font-semibold">IGV: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalIgv)}
            </span>
          </div>
          <div className="shadow-md shadow-mist-500 px-2 rounded-md bg-mist-500 text-mist-50">
            <span className="font-semibold">No Gravadas: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalNoGravadas)}
            </span>
          </div>
          <div className="shadow-md shadow-mist-500 px-2 rounded-md bg-mist-500 text-mist-50">
            <span className="font-semibold">Otros: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalOtros)}
            </span>
          </div>
          <div className="shadow-md shadow-mist-500 px-2 rounded-md bg-mist-500 text-mist-50">
            <span className="font-semibold">Total: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalTotal)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Tooltip placement="bottom" title={"Exportar a Excel"}>
            <Button
              size="small"
              onClick={handleExportExcel}
              disabled={selectedRows.size === 0}
            >
              Exportar ({selectedRows.size})
            </Button>
          </Tooltip>
          <Button
            size="small"
            danger
            onClick={handleDelete}
            disabled={selectedRows.size === 0}
          >
            Eliminar
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={handlerSave}
            loading={isSaving}
            disabled={!hasChanges || isSaving}
          >
            Guardar
          </Button>
          <Tooltip placement="bottom" title={"Ir al final de tabla"}>
            <Button type="dashed" size="small" onClick={scrollToBottom}>
              <FaCaretDown />
            </Button>
          </Tooltip>
        </div>
      </header>

      <div className="flex-1 bg-mist-50 rounded-lg shadow-md shadow-mist-400 border border-mist-300 overflow-hidden max-w-200 md:max-w-full">
        <DataGrid
          ref={gridRef}
          columns={columns}
          rows={filteredSortedRows}
          headerRowHeight={60}
          rowKeyGetter={(row) => row.id}
          onRowsChange={handleRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          onCellClick={(args) => {
            const rowIdx = filteredSortedRows.findIndex(
              (r) => r.id === args.row.id,
            );
            const colIdx = columns.findIndex((c) => c.key === args.column.key);
            if (rowIdx !== -1) setActiveCell({ rowIdx, colIdx });
          }}
          className="rdg-light h-full"
        />
      </div>
    </div>
  );
}

export default TablaGridBaseCompras;
