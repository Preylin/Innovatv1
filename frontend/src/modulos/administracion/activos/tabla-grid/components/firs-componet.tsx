import "react-data-grid/lib/styles.css";
import {
  DataGrid,
  renderTextEditor,
  useHeaderRowSelection,
  useRowSelection,
  type Column,
  type RenderCellProps,
  type RenderHeaderCellProps,
  type SortColumn,
  type RowsChangeData, // Re-integrado correctamente
  type CellMouseArgs,
} from "react-data-grid";
import { Button, message } from "antd";
import dayjs from "dayjs";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { type Row } from "../data/data-grid";
import DataChangeManager from "../data/DataChangeManager";
import { useMutation } from "@tanstack/react-query";
import { useCajaChicaLista } from "../../../../tesoreria/efectivo/data/api.cajaChica";

interface SelectedRange {
  rowIdx: number;
  colIdx: number;
}

// --- Componentes de Celda y Cabecera ---

function CustomSelectCell({ row }: RenderCellProps<Row>) {
  const { isRowSelectionDisabled, isRowSelected, onRowSelectionChange } =
    useRowSelection();
  return (
    <input
      type="checkbox"
      className="cursor-pointer"
      disabled={isRowSelectionDisabled}
      checked={isRowSelected}
      onChange={(e) =>
        onRowSelectionChange({
          row,
          checked: e.target.checked,
          isShiftClick: (e.nativeEvent as MouseEvent).shiftKey,
        })
      }
    />
  );
}

function CustomHeaderCell() {
  const { isIndeterminate, isRowSelected, onRowSelectionChange } =
    useHeaderRowSelection();
  const checkboxRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate && !isRowSelected;
    }
  }, [isIndeterminate, isRowSelected]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      className="cursor-pointer"
      checked={isRowSelected}
      onChange={(e) => onRowSelectionChange({ checked: e.target.checked })}
    />
  );
}

function CustomHeader({ column, sortDirection }: RenderHeaderCellProps<Row>) {
  return (
    <div className="flex items-center justify-between w-full px-2">
      <span className="font-bold">{column.name}</span>
      {sortDirection && (
        <span className="text-blue-600 font-bold">
          {sortDirection === "ASC" ? " ↑" : " ↓"}
        </span>
      )}
    </div>
  );
}

// --- Configuración de Columnas Actualizada ---
const getColumns = (
  updateCell: (rowId: number, field: keyof Row, value: any) => void,
): readonly Column<Row>[] => [
  {
    key: "select",
    name: "",
    width: 40,
    renderHeaderCell: () => <CustomHeaderCell />,
    renderCell: CustomSelectCell,
    cellClass: "flex items-center justify-center",
    headerCellClass: "flex items-center justify-center",
  },
  {
    key: "id",
    name: "Nro",
    width: 50,
    renderHeaderCell: CustomHeader,
    cellClass: "text-center text-gray-400 font-mono text-xs",
  },
  {
    key: "fecha",
    name: "Fecha",
    width: 150,
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors"
        type="date"
        // Formateamos para que el input date lo entienda (YYYY-MM-DD)
        value={row.fecha ? dayjs(row.fecha).format("YYYY-MM-DD") : ""}
        onChange={(e) => updateCell(row.id, "fecha", e.target.value)}
      />
    ),
  },
  {
    key: "descripcion",
    name: "Descripción",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors"
        type="text"
        placeholder="Añadir descripción..."
        value={row.descripcion}
        onChange={(e) => updateCell(row.id, "descripcion", e.target.value)}
      />
    ),
  },
  {
    key: "referencia",
    name: "Referencia",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors"
        type="text"
        value={row.referencia || ""}
        onChange={(e) => updateCell(row.id, "referencia", e.target.value)}
      />
    ),
  },
  {
    key: "ingreso",
    name: "Ingreso",
    width: 120,
    headerCellClass: "text-right",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <div className="text-right pr-4 font-medium text-green-700">
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.ingreso)}
      </div>
    ),
    editable: true, // Dejamos que este use el editor de texto normal para valores numéricos
    renderEditCell: renderTextEditor,
  },
  {
    key: "egreso",
    name: "Egreso",
    width: 120,
    headerCellClass: "text-right",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <div className="text-right pr-4 font-medium text-red-700">
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.egreso)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,
  },
  {
    key: "saldo",
    name: "Saldo",
    width: 130,
    headerCellClass: "text-right",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <div
        className={`text-right pr-4 font-bold ${row.saldo < 0 ? "text-red-600" : "text-blue-700"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.saldo)}
      </div>
    ),
  },
  {
    key: "adicionales",
    name: "Adicionales",
    renderHeaderCell: CustomHeader,
    renderCell: ({ row }: RenderCellProps<Row>) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors"
        type="text"
        value={row.adicionales || ""}
        onChange={(e) => updateCell(row.id, "adicionales", e.target.value)}
      />
    ),
  },
];

const createEmptyRow = (id: number): Row => ({
  id,
  fecha: "",
  descripcion: "",
  referencia: "",
  ingreso: 0,
  egreso: 0,
  saldo: 0,
  adicionales: "",
});

// --- Componente Principal ---

function FirsComponetsdataGrid() {
  // 1. Obtener datos de la API
  const { data: apiData, isLoading, isError } = useCajaChicaLista();

  // 2. Estado local para la UI (incluye filas temporales y ediciones)
  const [rows, setRows] = useState<Row[]>([]);

  // 3. El Manager de cambios (Persistente entre renders con useRef)
  const changeManager = useRef(new DataChangeManager<Row>([]));

  // Sincronizar datos iniciales cuando la API responda
  useEffect(() => {
    if (apiData) {
      // 1. Inicializamos el manager (él se encarga de añadir el saldo: 0 internamente)
      changeManager.current = new DataChangeManager<Row>(apiData);

      // 2. Preparamos las filas para el estado local con saldo inicial
      const rowsWithSaldo: Row[] = apiData.map((item) => ({
        ...item,
        saldo: 0, // El saldo real se calculará en el useMemo 'sortedRows'
      }));

      const lastId =
        rowsWithSaldo.length > 0
          ? Math.max(...rowsWithSaldo.map((r) => r.id))
          : 0;

      // 3. Seteamos el estado con la estructura completa
      setRows([...rowsWithSaldo, createEmptyRow(lastId + 1)]);
    }
  }, [apiData]);

  // --- Lógica de Actualización ---
  const updateCell = useCallback(
    (rowId: number, field: keyof Row, value: any) => {
      setRows((prevRows) => {
        return prevRows.map((r) => {
          if (r.id === rowId) {
            const updated = { ...r, [field]: value };

            // Verificamos si el ID existía originalmente en lo que trajo la API
            // Usamos apiData directamente aquí ya que está en las dependencias
            const isNew = !apiData?.some((apiR) => apiR.id === rowId);

            changeManager.current.registerChange(rowId, updated, isNew);
            return updated;
          }
          return r;
        });
      });
    },
    [apiData],
  ); // apiData es necesario aquí para saber si la fila es nueva

  // --- Envío a la API ---
  const { mutateAsync: saveChanges } = useMutation({
    mutationFn: async () => {
      const payload = changeManager.current.getPendingPayload();
      if (!changeManager.current.hasChanges()) {
        message.info("No hay cambios pendientes");
        return;
      }

      console.log("Enviando delta al servidor:", payload);
      // return await api.post('/sync', payload);
      return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación
    },
    onSuccess: () => {
      message.success("Datos sincronizados con el servidor");
      changeManager.current.clear();
      // Opcional: queryClient.invalidateQueries(['caja-chica'])
      // para refrescar y que las filas "NEW" ahora sean "Originales"
    },
  });

  // para guardar los datos haciendo uso del boton guardar

  const hadlerSave = async () => {
    try {
      await saveChanges();
    } catch {
      alert("Error al guardar los datos");
    }
  };
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [activeCell, setActiveCell] = useState<SelectedRange | null>(null);

  const columns = useMemo(() => getColumns(updateCell), [updateCell]);

  // Solución al aviso de 'useMemo' y 'sortColumns' no usados
  const sortedRows = useMemo(() => {
    let baseRows = [...rows];

    // 1. Aplicar ordenamiento si existe
    if (sortColumns.length > 0) {
      baseRows.sort((a, b) => {
        for (const sort of sortColumns) {
          const { columnKey, direction } = sort;
          const aValue = a[columnKey as keyof Row] ?? "";
          const bValue = b[columnKey as keyof Row] ?? "";
          if (aValue < bValue) return direction === "ASC" ? -1 : 1;
          if (aValue > bValue) return direction === "ASC" ? 1 : -1;
        }
        return 0;
      });
    }

    // 2. Cálculo de saldos en cascada
    let saldoAcumulado = 0;
    return baseRows.map((row) => {
      saldoAcumulado += (Number(row.ingreso) || 0) - (Number(row.egreso) || 0);
      return { ...row, saldo: saldoAcumulado };
    });
  }, [rows, sortColumns]);

  // Solución al aviso de 'data' (RowsChangeData) no usado
  const handleRowsChange = useCallback(
    (newRows: Row[], data: RowsChangeData<Row>) => {
      const updatedWithEmpty = [...newRows];

      // Registrar todas las filas afectadas
      data.indexes.forEach((index: number) => {
        const updatedRow = updatedWithEmpty[index];
        const isNew = !apiData?.some((apiR) => apiR.id === updatedRow.id);
        changeManager.current.registerChange(updatedRow.id, updatedRow, isNew);
      });

      // Lógica original de añadir fila vacía al final
      const lastId = Math.max(...updatedWithEmpty.map((r) => r.id), 0);
      const lastRow = updatedWithEmpty[updatedWithEmpty.length - 1];

      const isLastRowNotEmpty =
        lastRow.fecha !== "" ||
        lastRow.descripcion !== "" ||
        lastRow.ingreso !== 0 ||
        lastRow.egreso !== 0;

      if (isLastRowNotEmpty) {
        updatedWithEmpty.push(createEmptyRow(lastId + 1));
      }

      setRows(updatedWithEmpty);
    },
    [apiData],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const text = event.clipboardData.getData("text/plain");
      if (!text || !activeCell) return;

      const gridData = text
        .split(/\r?\n/)
        .filter((r) => r.trim().length > 0)
        .map((r) => r.split("\t"));

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        const maxNeededIndex = activeCell.rowIdx + gridData.length;

        // 1. Asegurar que existan suficientes filas
        if (maxNeededIndex >= updatedRows.length) {
          const rowsToAdd = maxNeededIndex - updatedRows.length + 1;
          const lastId =
            updatedRows.length > 0
              ? Math.max(...updatedRows.map((r) => r.id))
              : 0;
          for (let i = 1; i <= rowsToAdd; i++) {
            updatedRows.push(createEmptyRow(lastId + i));
          }
        }

        // 2. Procesar el pegado fila por fila
        gridData.forEach((rowData, i: number) => {
          const rowIndex = activeCell.rowIdx + i;
          if (rowIndex >= updatedRows.length) return;

          // Clonamos la fila actual para no mutar el estado directamente
          const updatedRow = { ...updatedRows[rowIndex] };

          rowData.forEach((value, j: number) => {
            const colIndex = activeCell.colIdx + j;
            const column = columns[colIndex];

            if (column?.editable && column.key !== "select") {
              const isNumeric = ["ingreso", "egreso"].includes(column.key);
              if (isNumeric) {
                let cleanValue = value.replace(/[^0-9.-]/g, "");
                const num = parseFloat(cleanValue);
                (updatedRow as any)[column.key] = isNaN(num) ? 0 : num;
              } else {
                (updatedRow as any)[column.key] = value;
              }
            }
          });

          // 3. Registrar la fila completa en el Manager después de procesar sus celdas
          const isNew = !apiData?.some((apiR) => apiR.id === updatedRow.id);
          changeManager.current.registerChange(
            updatedRow.id,
            updatedRow,
            isNew,
          );

          updatedRows[rowIndex] = updatedRow;
        });

        return updatedRows;
      });

      message.success("Datos procesados y registrados");
    },
    [activeCell, apiData, columns], // rows se obtiene del funcional setRows
  );

  const handleCellClick = useCallback(
    (args: CellMouseArgs<Row>) => {
      // Buscamos el índice en sortedRows, que es lo que el usuario está viendo
      const rowIdx = sortedRows.findIndex((r) => r.id === args.row.id);
      const colIdx = columns.findIndex((c) => c.key === args.column.key);
      setActiveCell({ rowIdx, colIdx });
    },
    [sortedRows], // Cambiado de rows a sortedRows
  );

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar los datos</div>;

  return (
    <div
      className="flex flex-col gap-4 p-6 bg-gray-50 h-screen"
      onPaste={handlePaste}
    >
      <header className="flex justify-between items-center bg-white p-4 shadow-sm rounded-lg">
        <h1 className="text-xl font-bold">Registro de Caja Chica</h1>
        <div className="flex gap-2">
          <Button
            danger
            disabled={selectedRows.size === 0}
            onClick={() => {
              setRows(rows.filter((r) => !selectedRows.has(r.id)));
              setSelectedRows(new Set());
            }}
          >
            Eliminar Selección
          </Button>
          <Button type="primary" onClick={hadlerSave}>
            Guardar
          </Button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-lg shadow-inner overflow-hidden">
        <DataGrid
          columns={columns}
          rows={sortedRows}
          rowKeyGetter={(row) => row.id}
          onRowsChange={handleRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          onCellClick={handleCellClick}
          className="rdg-light h-full"
        />
      </div>
    </div>
  );
}

export default FirsComponetsdataGrid;
