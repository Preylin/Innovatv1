import "react-data-grid/lib/styles.css";
import {
  DataGrid,
  type Column,
  type SortColumn,
  type RowsChangeData, // Re-integrado correctamente
  type DataGridHandle,
} from "react-data-grid";
import { Button, Dropdown, message, Tooltip, type MenuProps } from "antd";
import dayjs from "dayjs";

import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type FC,
} from "react";
import DataChangeManager from "../data/DataChangeManager";
import ExcelJS from "exceljs";
import { FaCaretDown } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";
import { Link } from "@tanstack/react-router";

const items: MenuProps["items"] = [
  {
    key: "1",
    label: (
      <Link to={"/tesoreria/movimiento/caja"}>
        <div className="text-[12px]">Caja Chica</div>
      </Link>
    ),
  },
  {
    key: "2",
    label: (
      <Link to={"/tesoreria/movimiento/soles"}>
        <div className="text-[12px]">Bcp Soles</div>
      </Link>
    ),
  },
  {
    key: "3",
    label: (
      <Link to={"/tesoreria/movimiento/dolares"}>
        <div className="text-[12px] truncate">Bcp Dólares</div>
      </Link>
    ),
  },
];

const ButtonNavigation: FC = () => (
  <Tooltip placement="bottom" title={"Ir a"}>
    <Dropdown menu={{ items }} placement="bottom" trigger={["click"]}>
      <Button type="dashed" size="small">
        <CiViewList />
      </Button>
    </Dropdown>
  </Tooltip>
);

export type Filters = Record<string, string>;

// Agregamos un Generic T que extienda de un objeto con ID y Key mínimos
interface BaseRow {
  id: number;
  key: number;
}

interface Props<T extends BaseRow> {
  data: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
  title: string;
  icon?: ReactNode;
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
  headerSummary?: (filteredRows: T[]) => ReactNode;
}

function TablaGridBase<T extends BaseRow>({
  data,
  isLoading,
  isError,
  title,
  icon,
  excelFileName = "Export",
  moneda,
  mapDataApi,
  syncData,
  deleteItems,
  getColumns,
  createEmptyRow,
  rowProcessor,
  headerSummary,
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
  const changeManager = useRef(new DataChangeManager<T>([]));
  const apiData = useMemo(
    () => (data ? mapDataApi(data) : []),
    [data, mapDataApi],
  );

  useEffect(() => {
    if (apiData.length >= 0) {
      changeManager.current = new DataChangeManager<T>(apiData);
      const lastId =
        apiData.length > 0 ? Math.max(...apiData.map((r) => r.id)) : 0;
      setRows([...apiData, createEmptyRow(lastId + 1)]);
    }
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
  const handlerSave = async () => {
    const pending = changeManager.current.getPendingPayload();
    if (!changeManager.current.hasChanges()) {
      message.info("No hay cambios pendientes");
      return;
    }
    try {
      await syncData(pending);
      message.success("Sincronización exitosa");
      changeManager.current.clear();
    } catch (error) {
      message.error("Error al sincronizar");
    }
  };

  const filteredSortedRows = useMemo(() => {
    let baseRows = [...rows];

    // Filtrado
    if (Object.keys(filters).length > 0) {
      baseRows = baseRows.filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const cellValue = row[key as keyof T];
          if (cellValue === null || cellValue === undefined) return false;
          return cellValue
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        });
      });
    }

    // Ordenamiento
    if (sortColumns.length > 0) {
      baseRows.sort((a, b) => {
        for (const sort of sortColumns) {
          const { columnKey, direction } = sort;
          const aValue = a[columnKey as keyof T] ?? "";
          const bValue = b[columnKey as keyof T] ?? "";
          if (aValue < bValue) return direction === "ASC" ? -1 : 1;
          if (aValue > bValue) return direction === "ASC" ? 1 : -1;
        }
        return 0;
      });
    }

    // Procesamiento adicional (ej: calcular saldos si se provee la función)
    if (rowProcessor) {
      return rowProcessor(baseRows, apiData);
    }

    return baseRows;
  }, [rows, sortColumns, filters, apiData, rowProcessor]);

  // Solución al aviso de 'data' (RowsChangeData) no usado
  // --- Lógica de Actualización de Filas ---
  const handleRowsChange = useCallback(
    (newRows: T[], data: RowsChangeData<T>) => {
      const updatedRows = [...newRows];

      // 1. Registrar los cambios en el manager
      data.indexes.forEach((index: number) => {
        const updatedRow = updatedRows[index];
        const isNew = !apiData?.some((apiR) => apiR.id === updatedRow.id);
        changeManager.current.registerChange(updatedRow.id, updatedRow, isNew);
      });

      // 2. Lógica inteligente para añadir fila vacía
      // Obtenemos la última fila actual
      const lastRow = updatedRows[updatedRows.length - 1];

      // Verificamos si la fila que se acaba de editar es la última fila de la lista
      const isEditingLastRow = data.indexes.includes(updatedRows.length - 1);

      if (isEditingLastRow) {
        // Definimos qué significa que la fila "tenga datos"
        // (excluimos campos técnicos como id y key)
        const hasData = Object.entries(lastRow).some(([key, value]) => {
          if (key === "id" || key === "key") return false;
          return (
            value !== "" && value !== 0 && value !== null && value !== undefined
          );
        });

        // Solo añadimos si la última fila ahora tiene contenido
        if (hasData) {
          const nextId = Math.max(...updatedRows.map((r) => r.id), 0) + 1;
          updatedRows.push(createEmptyRow(nextId));
        }
      }

      setRows(updatedRows);
    },
    [apiData, createEmptyRow],
  );

  const cleanNumericValue = (value: string): number => {
    if (!value) return 0;

    // 1. Quitar símbolos de moneda y espacios extra
    let clean = value.replace(/[S\/\.\$]/g, "").trim();

    // 2. Detectar el formato:
    // Si hay comas y puntos, el último es el decimal.
    // Si solo hay un tipo de separador, verificamos si aparece una sola vez cerca del final.

    const lastComma = clean.lastIndexOf(",");
    const lastDot = clean.lastIndexOf(".");

    if (lastComma > lastDot) {
      // Caso: 1.234,56 o 1234,56 -> La coma es el decimal
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > lastComma) {
      // Caso: 1,234.56 o 1234.56 -> El punto es el decimal
      clean = clean.replace(/,/g, "");
    } else {
      // Caso: No hay ninguno o son iguales (limpieza simple)
      clean = clean.replace(/,/g, "");
    }

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

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

            if (column && column.editable && column.key !== "select") {
              const rawValue = value.trim();

              // LÓGICA DE LIMPIEZA REFORZADA
              if (["ingreso", "egreso"].includes(column.key)) {
                // Aplicamos la limpieza de números mejorada
                (rowToUpdate as any)[column.key] = cleanNumericValue(rawValue);
              } else if (column.key === "fecha") {
                const parsedDate = dayjs(rawValue, [
                  "DD/MM/YYYY",
                  "YYYY-MM-DD",
                  "DD-MM-YYYY",
                  "MM/DD/YYYY",
                  "DD/MM/YY",
                  "D/M/YY",
                ]);
                (rowToUpdate as any)[column.key] = parsedDate.isValid()
                  ? parsedDate.format("YYYY-MM-DD")
                  : rawValue;
              } else {
                (rowToUpdate as any)[column.key] = rawValue;
              }
            }
          });

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
    if (selectedRows.size === 0) return message.warning("Selecciona filas");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    // 1. Configuración de columnas
    worksheet.columns = [
      { header: "Nro", key: "key", width: 10 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Descripción", key: "descripcion", width: 35 },
      { header: "Referencia", key: "referencia", width: 20 },
      { header: "Ingreso", key: "ingreso", width: 15 },
      { header: "Egreso", key: "egreso", width: 15 },
      { header: "Inf. Adicional", key: "adicionales", width: 30 },
    ];

    // Estilo para la cabecera
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" }, // Azul estándar
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // 2. Filtrar datos seleccionados
    const dataToExport = rows.filter((row) => selectedRows.has(row.id));

    // 3. Añadir los datos
    dataToExport.forEach((item) => {
      const newRow = worksheet.addRow({
        ...item,
        // Formateamos la fecha para Excel
        fecha: (item as any).fecha
          ? dayjs((item as any).fecha).format("DD/MM/YYYY")
          : "",
        // Aseguramos que los valores sean numéricos para que el formato aplique
        ingreso: Number((item as any).ingreso) || 0,
        egreso: Number((item as any).egreso) || 0,
      });

      // --- FORMATO DE MONEDA ---
      // La sintaxis correcta para incluir el símbolo es: "S/" #,##0.00
      // Usamos comillas dobles internas para el texto de la moneda
      const formatStr = `"${moneda}" #,##0.00`;

      newRow.getCell("ingreso").numFmt = formatStr;
      newRow.getCell("egreso").numFmt = formatStr;

      // Alineación para los montos
      newRow.getCell("ingreso").alignment = { horizontal: "right" };
      newRow.getCell("egreso").alignment = { horizontal: "right" };
    });

    // 4. Generación del archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${excelFileName}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }, [selectedRows, rows, excelFileName, moneda]); // Asegúrate de incluir 'moneda' en las dependencias

  const scrollToBottom = useCallback(() => {
    if (filteredSortedRows.length > 0 && gridRef.current) {
      // Hacemos scroll al índice de la última fila
      gridRef.current.scrollToCell({ rowIdx: filteredSortedRows.length - 1 });
    }
  }, [filteredSortedRows]);

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar los datos</div>;

  return (
    <div
      className="flex flex-col gap-1 p-1 h-[calc(100vh-58px)] min-w-200 md:w-full"
      onPaste={handlePaste}
    >
      <header className="flex justify-between items-center bg-white p-2 shadow-sm rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-base font-bold">{title}</h1>
        </div>

        {headerSummary && headerSummary(filteredSortedRows)}

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

          <ButtonNavigation />
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

export default TablaGridBase;
