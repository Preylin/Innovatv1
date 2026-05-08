import {
  renderTextEditor,
  useHeaderRowSelection,
  useRowSelection,
  type Column,
  type RenderCellProps,
} from "react-data-grid";
import {
  useCajaChicaLista,
  useDeleteCajaChica,
  useSyncCajaChica,
} from "../data/api.cajaChica";
import type { EfectivoSchemaOutApiType } from "../data/api.schema";
import type { Row } from "../data/interfaceTabla";
import TablaGridBase, { type Filters } from "./TablaGridBase";
import { useLayoutEffect, useRef } from "react";
import dayjs from "dayjs";
import { UseComercialesIconsLO } from "../../../../components/atoms/icons/OtrasLibs/Comerciales";

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

function FilterHeader({
  column,
  filters,
  setFilters,
}: {
  column: Column<Row>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  return (
    <div className="flex flex-col w-full p-1 gap-1">
      <span className="font-bold text-xs truncate text-[12px] md:text-[14px]">
        {column.name}
      </span>
      <input
        className="w-full p-1 text-xs font-normal border rounded outline-none focus:border-blue-400"
        placeholder="Buscar..."
        value={filters[column.key] || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, [column.key]: e.target.value }))
        }
        onClick={(e) => e.stopPropagation()} // Evita que el click para filtrar active el Sort
      />
    </div>
  );
}

// --- Configuración de Columnas Actualizada ---
const getColumns = (
  updateCell: (rowId: number, field: keyof Row, value: any) => void,
  filters: Filters, // <--- NUEVO
  setFilters: React.Dispatch<React.SetStateAction<Filters>>, // <--- NUEVO
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
    key: "key",
    name: "Nro",
    width: 50,
    headerCellClass: "text-center",
    renderCell: ({ row }) => {
      return (
        <div className="text-center text-[10px] md:text-[12px]">{row.key}</div>
      );
    },
  },
  {
    key: "fecha",
    name: "Fecha",
    width: 115,
    editable: true,
    sortable: true,
    headerCellClass: "text-center",
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <input
        className="w-full h-full bg-transparent outline-none px-1.5 focus:bg-blue-50 transition-colors text-[10px] md:text-[12px]"
        type="date"
        value={row.fecha ? dayjs(row.fecha).format("YYYY-MM-DD") : ""}
        onChange={(e) => updateCell(row.id, "fecha", e.target.value)}
      />
    ),
    cellClass: (row) => (row.fecha === "" ? "bg-red-100" : ""),
  },
  {
    key: "descripcion",
    name: "Descripción",
    resizable: true,
    editable: true,
    minWidth: 200,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors text-[10px] md:text-[12px]"
        type="text"
        placeholder="Añadir descripción..."
        value={row.descripcion}
        onChange={(e) => updateCell(row.id, "descripcion", e.target.value)}
        maxLength={700}
      />
    ),
    cellClass: (row) => {
      if (row.descripcion === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "referencia",
    name: "Referencia",
    width: 120,
    editable: true,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <input
        className="w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors text-[10px] md:text-[12px]"
        type="text"
        value={row.referencia || ""}
        onChange={(e) => updateCell(row.id, "referencia", e.target.value)}
        maxLength={100}
      />
    ),
    cellClass: (row) => {
      if (row.referencia === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "ingreso",
    name: "Ingreso",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[10px] md:text-[12px] ${row.ingreso >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.ingreso)}
      </div>
    ),
    editable: true, // Dejamos que este use el editor de texto normal para valores numéricos
    renderEditCell: renderTextEditor,
    cellClass: (row) => {
      if (row.ingreso !== 0) return "bg-stone-100";
      return "";
    },
  },
  {
    key: "egreso",
    name: "Egreso",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[10px] md:text-[12px] ${row.egreso <= 0 ? "text-rose-600" : "text-cyan-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.egreso)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,
    cellClass: (row) => {
      if (row.egreso !== 0) return "bg-mauve-100";
      return "";
    },
  },
  {
    key: "saldo",
    name: "Saldo",
    width: 130,
    headerCellClass: "text-center bg-gray-100",
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-semibold text-[11px] md:text-[13px] ${row.saldo < 0 ? "text-rose-600" : "text-sky-700"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.saldo)}
      </div>
    ),
    cellClass: (row) => {
      if (row.saldo === 0) return "bg-red-100";
      return "bg-gray-100";
    },
  },
  {
    key: "adicionales",
    name: "Inf. Adicional",
    minWidth: 200,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props) => (
      <FilterHeader {...props} filters={filters} setFilters={setFilters} />
    ),
    renderCell: ({ row }) => (
      <input
        className="w-full h-full bg-transparent outline-none text-[10px] md:text-[12px] px-2 focus:bg-blue-50 transition-colors"
        type="text"
        value={row.adicionales || ""}
        onChange={(e) => updateCell(row.id, "adicionales", e.target.value)}
        maxLength={100}
      />
    ),
  },
];

const mapDataApi = (data: EfectivoSchemaOutApiType[]): Row[] => {
  return data.map((item, index) => ({
    key: index + 1,
    id: item.id,
    fecha: item.fecha,
    descripcion: item.descripcion,
    referencia: item.referencia,
    ingreso: item.ingreso,
    egreso: item.egreso,
    saldo: 0,
    adicionales: item.adicionales,
  }));
};
const rowProcessor = (rows: Row[], apiData: Row[]) => {
  let saldoAcumulado = 0;
  let visualIndex = 1;
  return rows.map((row) => {
    saldoAcumulado += (Number(row.ingreso) || 0) + (Number(row.egreso) || 0);
    const isSaved = apiData?.some((apiR) => apiR.id === row.id);
    return { ...row, saldo: saldoAcumulado, key: isSaved ? visualIndex++ : 0 };
  });
};
const createEmptyRow = (id: number): Row => ({
  key: 0,
  id,
  fecha: "",
  descripcion: "",
  referencia: "",
  ingreso: 0,
  egreso: 0,
  saldo: 0,
  adicionales: "",
});

function TableCajaChica() {
  const { data, isLoading, isError } = useCajaChicaLista();
  const { mutateAsync: syncData } = useSyncCajaChica();
  const { mutateAsync: deleteItems } = useDeleteCajaChica();
  const handleSync = async (payload: { created: Row[]; updates: Row[] }) => {
    const formattedPayload = {
      created: payload.created
        .filter((row) => row.fecha && row.descripcion)
        .map((row) => ({
          fecha: dayjs(row.fecha).toISOString(),
          descripcion: row.descripcion.trim(),
          referencia: row.referencia || null,
          ingreso: Number(row.ingreso) || 0,
          egreso: Number(row.egreso) || 0,
          adicionales: row.adicionales || null,
        })),
      updates: payload.updates.map((row) => ({
        id: row.id,
        fecha: dayjs(row.fecha).toISOString(),
        descripcion: row.descripcion.trim(),
        referencia: row.referencia || null,
        ingreso: Number(row.ingreso) || 0,
        egreso: Number(row.egreso) || 0,
        adicionales: row.adicionales || null,
      })),
    };

    await syncData(formattedPayload);
  };

  return (
    <TablaGridBase
      icon={
        <UseComercialesIconsLO
          name="cajaChica"
          className="text-amber-600 animate-bounce"
          fontSize={20}
        />
      }
      data={data}
      isLoading={isLoading}
      isError={isError}
      moneda="S/"
      deleteItems={deleteItems}
      mapDataApi={mapDataApi}
      getColumns={getColumns}
      createEmptyRow={createEmptyRow}
      rowProcessor={rowProcessor}
      syncData={handleSync}
      title="Registro Caja Chica"
      headerSummary={(rows) => (
        <div className="bg-mist-600 px-2 py-1 font-semibold rounded-lg text-white">
          Saldo:{" "}
          {new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
          }).format(rows[rows.length - 1]?.saldo)}
        </div>
      )}
    />
  );
}

export default TableCajaChica;
