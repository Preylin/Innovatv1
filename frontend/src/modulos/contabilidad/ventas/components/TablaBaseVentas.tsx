import "react-data-grid/lib/styles.css";
import {
  DataGrid,
  type Column,
  type SortColumn,
  type RowsChangeData, // Re-integrado correctamente
  type DataGridHandle,
} from "react-data-grid";
import { Button, message, Skeleton, Tooltip } from "antd";
import dayjs from "dayjs";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import ExcelJS from "exceljs";
import { FaCaretDown } from "react-icons/fa";
import DataChangeManagerVentas from "../utils/DataChangeManagerVentas";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";

export type Filters = Record<string, string>;

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
  // Opcional: Para lógica específica como el cálculo de saldos
  rowProcessor?: (rows: T[], apiData: T[]) => T[];
  // Opcional: Para mostrar un resumen en el header (como el saldo total)
}

function TablaGridBaseVentas<T extends BaseRow>({
  data,
  isLoading,
  isError,
  totalBaseImponible,
  totalIgv,
  totalTotal,
  excelFileName = "Export",
  moneda,
  mapDataApi,
  syncData,
  deleteItems,
  getColumns,
  createEmptyRow,
  rowProcessor,
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

  const changeManager = useRef(new DataChangeManagerVentas<T>([]));

  const apiData = useMemo(
    () => (data ? mapDataApi(data) : []),
    [data, mapDataApi],
  );

//   useEffect(() => {
//     if (apiData.length >= 0) {
//       changeManager.current = new DataChangeManagerVentas<T>(apiData);
//       const lastId =
//         apiData.length > 0 ? Math.max(...apiData.map((r) => r.id)) : 0;
//       setRows([...apiData, createEmptyRow(lastId + 1)]);
//     }
//   }, [apiData, createEmptyRow]);

  useEffect(() => {
    changeManager.current = new DataChangeManagerVentas<T>(apiData);
    const lastId =
      apiData.length > 0 ? Math.max(...apiData.map((r) => r.id)) : 0;
    setRows([...apiData, createEmptyRow(lastId + 1)]);
  }, [apiData, createEmptyRow]);

  // --- Lógica de Actualización ---
  const updateCell = useCallback(
    (rowId: number, field: keyof T, value: any) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id === rowId) {
            const updated = { ...r, [field]: value };
            const isNew = !apiData?.some((apiR) => apiR.id === rowId);
            changeManager.current.registerChange(rowId, updated, isNew);
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

  // apiData es necesario aquí para saber si la fila es nueva

  // --- Envío a la API ---
//   const handlerSave = async () => {
//     const pending = changeManager.current.getPendingPayload();
//     if (!changeManager.current.hasChanges()) {
//       message.info("No hay cambios pendientes");
//       return;
//     }
//     try {
//       await syncData(pending);
//       message.success("Sincronización exitosa");
//       changeManager.current.clear();
//     } catch (error) {
//       message.error("Error al sincronizar");
//     }
//   };

  const handlerSave = async () => {
    if (!changeManager.current.hasChanges()) {
      return message.info("No hay cambios pendientes");
    }
    const pending = changeManager.current.getPendingPayload();
    try {
      await syncData(pending);
      message.success("Datos guardados correctamente");
      // Importante: No limpiamos filas manualmente aquí, el useEffect de apiData lo hará al refrescarse el query
    } catch (error) {
      message.error("Error al sincronizar con el servidor");
    }
  };

//   const filteredSortedRows = useMemo(() => {
//     let baseRows = [...rows];

//     // Filtrado
//     if (Object.keys(filters).length > 0) {
//       baseRows = baseRows.filter((row) => {
//         return Object.entries(filters).every(([key, value]) => {
//           if (!value) return true;
//           const cellValue = row[key as keyof T];
//           if (cellValue === null || cellValue === undefined) return false;
//           return cellValue
//             .toString()
//             .toLowerCase()
//             .includes(value.toLowerCase());
//         });
//       });
//     }

//     // Ordenamiento
//     if (sortColumns.length > 0) {
//       baseRows.sort((a, b) => {
//         for (const sort of sortColumns) {
//           const { columnKey, direction } = sort;
//           const aValue = a[columnKey as keyof T] ?? "";
//           const bValue = b[columnKey as keyof T] ?? "";
//           if (aValue < bValue) return direction === "ASC" ? -1 : 1;
//           if (aValue > bValue) return direction === "ASC" ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     // Procesamiento adicional (ej: calcular saldos si se provee la función)
//     if (rowProcessor) {
//       return rowProcessor(baseRows, apiData);
//     }

//     return baseRows;
//   }, [rows, sortColumns, filters, apiData, rowProcessor]);

  const filteredSortedRows = useMemo(() => {
    let baseRows = [...rows];

    if (Object.keys(filters).length > 0) {
      baseRows = baseRows.filter((row) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const cellValue = row[key as keyof T];
          return String(cellValue ?? "").toLowerCase().includes(value.toLowerCase());
        })
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

  // Solución al aviso de 'data' (RowsChangeData) no usado
  // --- Lógica de Actualización de Filas ---
//   const handleRowsChange = useCallback(
//     (newRows: T[], data: RowsChangeData<T>) => {
//       const updatedRows = [...newRows];

//       // 1. Registrar los cambios en el manager
//       data.indexes.forEach((index: number) => {
//         const updatedRow = updatedRows[index];
//         const isNew = !apiData?.some((apiR) => apiR.id === updatedRow.id);
//         changeManager.current.registerChange(updatedRow.id, updatedRow, isNew);
//       });

//       // 2. Lógica inteligente para añadir fila vacía
//       // Obtenemos la última fila actual
//       const lastRow = updatedRows[updatedRows.length - 1];

//       // Verificamos si la fila que se acaba de editar es la última fila de la lista
//       const isEditingLastRow = data.indexes.includes(updatedRows.length - 1);

//       if (isEditingLastRow) {
//         // Definimos qué significa que la fila "tenga datos"
//         // (excluimos campos técnicos como id y key)
//         const hasData = Object.entries(lastRow).some(([key, value]) => {
//           if (key === "id" || key === "key") return false;
//           return (
//             value !== "" && value !== 0 && value !== null && value !== undefined
//           );
//         });

//         // Solo añadimos si la última fila ahora tiene contenido
//         if (hasData) {
//           const nextId = Math.max(...updatedRows.map((r) => r.id), 0) + 1;
//           updatedRows.push(createEmptyRow(nextId));
//         }
//       }

//       setRows(updatedRows);
//     },
//     [apiData, createEmptyRow],
//   );

  const handleRowsChange = useCallback((newRows: T[], data: RowsChangeData<T>) => {
    const updatedRows = [...newRows];
    
    data.indexes.forEach((index) => {
      const updatedRow = updatedRows[index];
      const isNew = !apiData.some((apiR) => apiR.id === updatedRow.id);
      changeManager.current.registerChange(updatedRow.id, updatedRow, isNew);
    });

    const lastRow = updatedRows[updatedRows.length - 1];
    const isEditingLastRow = data.indexes.includes(updatedRows.length - 1);

    if (isEditingLastRow) {
      const hasData = Object.entries(lastRow).some(([k, v]) => 
        !["id", "key"].includes(k) && v !== "" && v !== 0 && v !== null
      );
      if (hasData) {
        const nextId = Math.max(...updatedRows.map((r) => r.id), 0) + 1;
        updatedRows.push(createEmptyRow(nextId));
      }
    }
    setRows(updatedRows);
  }, [apiData, createEmptyRow]);

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

    // Manejo de negativos contables tradicionales: (100.00) -> -100.00
    const isParenthesisNegative = clean.startsWith("(") && clean.endsWith(")");
    if (isParenthesisNegative) clean = clean.replace(/[()]/g, "");

    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");

    if (lastComma > lastDot) {
      // Caso "35341,60" o "1.250,60" -> Coma es decimal
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > lastComma) {
      // Caso "1,250.60" -> Punto es decimal
      clean = clean.replace(/,/g, "");
    } else if (lastComma !== -1 && lastDot === -1) {
      // Caso redundante de seguridad para comas solitarias
      clean = clean.replace(",", ".");
    }

    let num = parseFloat(clean);
    if (isParenthesisNegative && num > 0) num *= -1;

    return isNaN(num) ? 0 : num;
  };

  // 2. Función principal de pegado masivo (Portapapeles)
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();

      const text = event.clipboardData.getData("text/plain");
      if (!text || !activeCell) return;

      // Procesamos filas (salto de línea) y celdas (tabulaciones de Excel)
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

        // Inyección automática de nuevas filas vacías si el copiado supera el límite actual
        if (rowsToCreate > 0) {
          let lastId =
            currentRows.length > 0
              ? Math.max(...currentRows.map((r) => r.id))
              : 0;
          for (let i = 1; i <= rowsToCreate; i++) {
            const newRow = createEmptyRow(lastId + i);
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

            // Validamos que la columna exista, sea editable y no sea el selector de filas
            if (column && column.editable && column.key !== "select") {
              const rawValue = value.trim();
              const key = column.key as keyof typeof rowToUpdate;

              // --- Clasificación de mapeo dinámico por tipo de columna ---

              const numericKeys = [
                "base_imponible",
                "igv",
                "total",
                "tipo_cambio",
                "ingreso",
                "egreso",
              ];
              const dateKeys = ["fecha_inicio", "fecha_fin"];

              if (numericKeys.includes(column.key)) {
                // Limpieza y parseo de importes numéricos
                (rowToUpdate as any)[key] = cleanNumericValue(rawValue);
              } else if (dateKeys.includes(column.key)) {
                // Parseo multi-formato para objetos de tipo Date nativos de JS
                if (!rawValue) {
                  (rowToUpdate as any)[key] =
                    column.key === "fecha_fin" ? null : "";
                } else {
                  const parsedDate = dayjs(rawValue, [
                    "DD/MM/YYYY",
                    "YYYY-MM-DD",
                    "DD-MM-YYYY",
                    "MM/DD/YYYY",
                    "DD/MM/YY",
                  ]);
                  (rowToUpdate as any)[key] = parsedDate.isValid()
                    ? parsedDate.toDate()
                    : null;
                }
              } else {
                // Sanitización estándar para cadenas de texto (Strings)
                (rowToUpdate as any)[key] = rawValue;
              }
            }
          });

          // Registrar cambios en el administrador de estado persistente (Backend)
          const isNew = !apiData?.some((apiR) => apiR.id === rowToUpdate.id);
          changeManager.current.registerChange(targetRowId, rowToUpdate, isNew);
          rowsMap.set(targetRowId, rowToUpdate);
        });

        return Array.from(rowsMap.values());
      });

      message.success("Datos pegados y normalizados");
    },
    [activeCell, apiData, columns, filteredSortedRows],
  );

  const handleDelete = async () => {
    if (selectedRows.size === 0) return;

    // Confirmación simple al usuario
    if (!confirm(`¿Estás seguro de eliminar ${selectedRows.size} registros?`))
      return;

    const idsToDelete = Array.from(selectedRows);

    try {
      // 2. Ejecutar eliminación en el Backend
      await deleteItems(idsToDelete);

      // 3. Actualización optimista: Remover de la UI inmediatamente
      setRows((prevRows) => {
        const updatedRows = prevRows.filter((row) => !selectedRows.has(row.id));
        return updatedRows;
      });

      // 4. Limpiar selección
      setSelectedRows(new Set());

      // Opcional: Notificación de éxito
      console.log("Eliminación exitosa");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudieron eliminar los registros. Intente de nuevo.");
    }
  };

  const handleExportExcel = useCallback(async () => {
    if (selectedRows.size === 0) return message.warning("Selecciona filas para exportar");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ventas");

    // Ajuste de columnas a la realidad de Ventas
    worksheet.columns = [
      { header: "Periodo", key: "periodo", width: 12 },
      { header: "F. Emisión", key: "fecha_inicio", width: 15 },
      { header: "F. Vencimiento", key: "fecha_fin", width: 15 },
      { header: "Tipo", key: "tipo_comp", width: 8 },
      { header: "Serie", key: "serie_comp", width: 10 },
      { header: "Número", key: "numero_comp", width: 15 },
      { header: "Tipo Emp", key: "tipo_empresa", width: 15 },
      { header: "Razón Social", key: "nombre_empresa", width: 35 },
      { header: "Base Imponible", key: "base_imponible", width: 15 },
      { header: "IGV", key: "igv", width: 15 },
      { header: "Total", key: "total", width: 15 },
      { header: "Moneda", key: "moneda", width: 15 },
      { header: "Tipo Cambio", key: "tipo_cambio", width: 15 },
      { header: "Categoria", key: "categoria", width: 15 },
      { header: "Descripción", key: "descripcion", width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1e293b" } };

    const dataToExport = rows.filter((row) => selectedRows.has(row.id));
    const formatStr = `"${moneda}" #,##0.00`;

    dataToExport.forEach((item) => {
      const row = worksheet.addRow({
        ...item,
      });
      ["base_imponible", "igv", "total"].forEach(key => {
        const cell = row.getCell(key);
        cell.numFmt = formatStr;
        cell.alignment = { horizontal: "right" };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${excelFileName}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
    a.click();
  }, [selectedRows, rows, excelFileName, moneda]);// Asegúrate de incluir 'moneda' en las dependencias

//   const scrollToBottom = useCallback(() => {
//     if (filteredSortedRows.length > 0 && gridRef.current) {
//       // Hacemos scroll al índice de la última fila
//       gridRef.current.scrollToCell({ rowIdx: filteredSortedRows.length - 1 });
//     }
//   }, [filteredSortedRows]);

const scrollToBottom = useCallback(() => {
    gridRef.current?.scrollToCell({ rowIdx: filteredSortedRows.length - 1 });
  }, [filteredSortedRows.length]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 15 }} />;
  if (isError || !data) return <ErrorResultServer />;

  return (
    <div
      className="flex flex-col gap-1 p-1 h-[calc(100vh-140px)] min-w-200 md:w-full"
      onPaste={handlePaste}
    >
      <header className="flex justify-between items-center px-2">
        <div className="flex gap-2">
          <div className="shadow shadow-mist-300 px-1 rounded-md bg-mist-200">
            <span className="font-semibold italic">Base Imponible: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalBaseImponible)}
            </span>
          </div>
          <div className="shadow shadow-mist-300 px-1 rounded-md bg-mist-200">
            <span className="font-semibold italic">IGV: </span>
            <span>
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(totalIgv)}
            </span>
          </div>
          <div className="shadow shadow-mist-300 px-1 rounded-md bg-mist-200">
            <span className="font-semibold italic">Total: </span>
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
            loading={isLoading}
            disabled={!changeManager.current.hasChanges()}
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

      <div className="flex-1 bg-white rounded-lg shadow-inner overflow-hidden max-w-200 md:max-w-full ">
        <DataGrid
          ref={gridRef}
          columns={columns}
          rows={filteredSortedRows}
          headerRowHeight={70}
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

export default TablaGridBaseVentas;
