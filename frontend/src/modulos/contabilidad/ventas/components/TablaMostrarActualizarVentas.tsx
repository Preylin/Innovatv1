import {
  renderTextEditor,
  useHeaderRowSelection,
  useRowSelection,
  type Column,
  type RenderCellProps,
  type RenderEditCellProps,
} from "react-data-grid";
import { useLayoutEffect, useMemo, useRef } from "react";
import { format } from "date-fns"; // ◄ Cambiado de dayjs a date-fns
import TablaGridBaseVentas, { type Filters } from "./TablaBaseVentas";
import type { RowTableVentas } from "../utils/interfaceTablaVentas";
import {
  useContabilidadVentasLista,
  useDeleteContabilidadVentas,
  useSyncbContabilidadVentas,
} from "../data/api.ventas/api.contabilidadVentas";
import type { TablaVentasSchemaApiOutType } from "../data/api.schemasVentas/api.schemaVentas";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownEditorProps<TRow> extends RenderEditCellProps<TRow> {
  options: DropdownOption[] | string[];
}

function DropdownEditor<TRow>({
  row,
  column,
  onRowChange,
  onClose,
  options,
}: DropdownEditorProps<TRow>) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  return (
    <select
      autoFocus
      className="w-full h-full bg-blue-50 outline-none border-none text-[12px] cursor-pointer"
      value={(row as any)[column.key] ?? ""}
      onChange={(event) => {
        onRowChange({ ...row, [column.key]: event.target.value }, true);
        onClose(true);
      }}
      onBlur={() => onClose(true)}
    >
      <option value="" disabled>
        Seleccione...
      </option>
      {normalizedOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CustomSelectCell({ row }: RenderCellProps<RowTableVentas>) {
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

const OPT_MONEDAS = [
  { value: "PEN", label: "PEN" },
  { value: "USD", label: "USD" },
];

const OPT_ESTADO = [
  { value: "0", label: "Inactivo" },
  { value: "1", label: "Activo" },
];

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
  column: Column<RowTableVentas>;
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
          setFilters((prev: Filters) => ({
            ...prev,
            [column.key]: e.target.value,
          }))
        }
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

const CellInput = ({
  value,
  onChange,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  type?: string;
  className?: string;
}) => (
  <input
    className={`w-full h-full bg-transparent outline-none px-2 focus:bg-blue-50 transition-colors text-[10px] md:text-[12px] ${className}`}
    type={type}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
  />
);

// Auxiliar para formatear de forma segura strings ISO crudos ("YYYY-MM-DD") a "yyyy-MM-dd" en local
const formatToInputDate = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr === "-") return "";
  try {
    // Reemplazamos guiones por barras para forzar la interpretación en hora local
    const normalized =
      typeof dateStr === "string" ? dateStr.replace(/-/g, "/") : dateStr;
    return format(new Date(normalized), "yyyy-MM-dd");
  } catch {
    return "";
  }
};

const getColumns = (
  updateCell: (rowId: number, field: keyof RowTableVentas, value: any) => void,
  filters: Filters,
  setFilters: React.Dispatch<React.SetStateAction<Filters>>,
): readonly Column<RowTableVentas>[] => [
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
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => {
      return (
        <div className="text-center text-[10px] md:text-[12px]">{row.key}</div>
      );
    },
  },
  {
    key: "periodo",
    name: "Periodo",
    editable: true,
    width: 60,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.periodo}
        onChange={(val) => updateCell(row.id, "periodo", val)}
      />
    ),
    cellClass: (row) => {
      if (row.periodo === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "fecha_inicio",
    name: "Emisión",
    width: 115,
    editable: true,
    sortable: true,
    headerCellClass: "text-center",
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        type="date"
        value={formatToInputDate(row.fecha_inicio)} // ◄ Modificado con date-fns local
        onChange={(val) => updateCell(row.id, "fecha_inicio", val)}
      />
    ),
    cellClass: (row) => (!row.fecha_inicio ? "bg-red-100" : ""),
  },
  {
    key: "fecha_fin",
    name: "Vencimiento",
    width: 115,
    editable: true,
    sortable: true,
    headerCellClass: "text-center",
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        type="date"
        value={formatToInputDate(row.fecha_fin)} // ◄ Modificado con date-fns local
        onChange={(val) => updateCell(row.id, "fecha_fin", val)}
      />
    ),
    cellClass: (row) => (!row.fecha_fin ? "bg-red-100" : ""),
  },
  {
    key: "tipo_comp",
    name: "Tipo",
    editable: true,
    width: 30,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.tipo_comp}
        onChange={(val) => updateCell(row.id, "tipo_comp", val)}
      />
    ),
    cellClass: (row) => {
      if (row.tipo_comp === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "serie_comp",
    name: "Serie",
    editable: true,
    width: 55,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.serie_comp}
        onChange={(val) => updateCell(row.id, "serie_comp", val)}
      />
    ),
    cellClass: (row) => {
      if (row.serie_comp === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "numero_comp",
    name: "Número",
    editable: true,
    width: 70,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.numero_comp}
        onChange={(val) => updateCell(row.id, "numero_comp", val)}
      />
    ),
    cellClass: (row) => {
      if (row.numero_comp === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "tipo_empresa",
    name: "Tipo",
    editable: true,
    width: 30,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.tipo_empresa}
        onChange={(val) => updateCell(row.id, "tipo_empresa", val)}
      />
    ),
    cellClass: (row) => {
      if (row.tipo_empresa === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "numero_empresa",
    name: "Número",
    editable: true,
    width: 90,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.numero_empresa}
        onChange={(val) => updateCell(row.id, "numero_empresa", val)}
      />
    ),
    cellClass: (row) => {
      if (row.numero_empresa === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "nombre_empresa",
    name: "Nombre Empresa",
    resizable: true,
    editable: true,
    minWidth: 200,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.nombre_empresa}
        onChange={(val) => updateCell(row.id, "nombre_empresa", val)}
      />
    ),
    cellClass: (row) => {
      if (row.nombre_empresa === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "base_imponible",
    name: "Base Imponible",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`pr-4 font-medium text-[12px] h-full flex items-center justify-end bg-slate-100 border-r border-black ${row.base_imponible >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.base_imponible)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,

  },
  {
    key: "igv",
    name: "IGV",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[12px] bg-gray-100 border-r border-black flex items-center justify-end h-full ${row.igv >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.igv)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,
  },
  {
    key: "total",
    name: "Total",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[12px] flex items-center justify-end h-full bg-stone-100  border-r border-black ${row.total >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.total)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,
  },
  {
    key: "moneda",
    name: "Moneda",
    editable: true,
    width: 75,
    renderEditCell: (props) => (
      <DropdownEditor {...props} options={OPT_MONEDAS} />
    ),
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.moneda}
        onChange={(val) => updateCell(row.id, "moneda", val)}
        className="text-center"
      />
    ),
    cellClass: (row) => {
      if (row.moneda === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "tipo_cambio",
    name: "T.C",
    width: 85,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[12px] flex items-center justify-end h-full bg-stone-100  border-x border-black ${row.tipo_cambio >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }).format(row.tipo_cambio)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,

  },
  {
    key: "categoria",
    name: "Categoría",
    editable: true,
    width: 100,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.categoria}
        onChange={(val) => updateCell(row.id, "categoria", val)}
      />
    ),
    cellClass: (row) => {
      if (row.categoria === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "descripcion",
    name: "Descripción",
    resizable: true,
    editable: true,
    minWidth: 150,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.descripcion || ""}
        onChange={(val) => updateCell(row.id, "descripcion", val)}
      />
    ),
    cellClass: (row) => {
      if (row.descripcion === "") return "bg-red-100";
      return "";
    },
  },
  {
    key: "monto_detraccion",
    name: "Detracción",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[12px] flex items-center justify-end h-full bg-taupe-100  border-l border-black ${row.monto_detraccion >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.monto_detraccion || 0)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,

  },
  {
    key: "monto_retencion",
    name: "Retención",
    width: 120,
    sortable: true,
    headerCellClass: "text-center",
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }) => (
      <div
        className={`text-right pr-4 font-medium text-[12px] flex items-center justify-end h-full bg-mauve-100  border-x border-black ${row.monto_retencion >= 0 ? "text-teal-700" : "text-orange-500"}`}
      >
        {new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
        }).format(row.monto_retencion)}
      </div>
    ),
    editable: true,
    renderEditCell: renderTextEditor,

  },
  {
    key: "is_active",
    name: "Estado",
    editable: true,
    width: 100,
    headerCellClass: "text-center",
    renderEditCell: (props) => (
      <DropdownEditor {...props} options={OPT_ESTADO} />
    ),
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => {
      const estadoEncontrado = OPT_ESTADO.find(
        (opt) => String(opt.value) === String(row.is_active),
      );

      return (
        <CellInput
          value={
            estadoEncontrado ? estadoEncontrado.label : (row.is_active ?? "")
          }
          onChange={(val) => updateCell(row.id, "is_active", val)}
          className="text-center"
        />
      );
    },
    cellClass: (row) => {
      if (
        row.is_active === null ||
        row.is_active === undefined ||
        row.is_active === ""
      ) {
        return "bg-red-100";
      }
      return "";
    },
  },
  {
    key: "link_pdf",
    name: "Link PDF",
    resizable: true,
    editable: true,
    width: 90,
    renderEditCell: renderTextEditor,
    renderHeaderCell: (props: {
      column: Column<RowTableVentas>;
      sortDirection: any;
      priority: any;
    }) => <FilterHeader {...props} filters={filters} setFilters={setFilters} />,
    renderCell: ({ row }: RenderCellProps<RowTableVentas>) => (
      <CellInput
        value={row.link_pdf || ""}
        onChange={(val) => updateCell(row.id, "link_pdf", val)}
      />
    ),
    cellClass: (row) => {
      if (row.link_pdf === "") return "bg-red-100";
      return "";
    },
  },
];

const mapDataApi = (data: TablaVentasSchemaApiOutType[]): RowTableVentas[] => {
  return data.map((item, index) => ({
    key: index + 1,
    id: item.id,
    periodo: item.periodo,
    fecha_inicio: item.fecha_emision,
    fecha_fin: item.fecha_vencimiento,
    tipo_comp: item.tipo_cp_codigo,
    serie_comp: item.serie,
    numero_comp: item.numero,
    tipo_empresa: item.tipo_documento || "",
    numero_empresa: item.nro_documento || "",
    nombre_empresa: item.razon_social || "",
    base_imponible: item.base_imponible,
    igv: item.igv,
    total: item.total,
    moneda: item.moneda,
    tipo_cambio: item.tipo_cambio,
    categoria: item.categoria || "",
    descripcion: item.descripcion_comprobante || "",
    monto_retencion: item.monto_retencion || 0,
    monto_detraccion: item.monto_detraccion || 0,
    is_active: item.is_active || "",
    link_pdf: item.link_pdf,
  }));
};

const rowProcessor = (
  rows: RowTableVentas[],
  apiData: RowTableVentas[],
): RowTableVentas[] => {
  let saldoAcumulado = 0;
  let visualIndex = 1;
  return rows.map((row) => {
    saldoAcumulado +=
      (Number(row.base_imponible) || 0) + (Number(row.igv) || 0);
    const isSaved = apiData?.some((apiR) => apiR.id === row.id);
    return { ...row, saldo: saldoAcumulado, key: isSaved ? visualIndex++ : 0 };
  });
};

const createEmptyRow = (id: number): RowTableVentas => ({
  key: 0,
  id,
  periodo: "",
  fecha_inicio: "",
  fecha_fin: "",
  tipo_comp: "",
  serie_comp: "",
  numero_comp: "",
  tipo_empresa: "",
  numero_empresa: "",
  nombre_empresa: "",
  base_imponible: 0,
  igv: 0,
  total: 0,
  moneda: "",
  tipo_cambio: 0,
  categoria: "",
  descripcion: "",
  monto_retencion: 0,
  monto_detraccion: 0,
  is_active: "",
  link_pdf: "",
});

interface Props {
  periodo: string;
}

// Auxiliar seguro para formatear los objetos Date o strings de la fila antes de enviarlos a la API
const safeFormatToApi = (dateInput: Date | string): string => {
  try {
    const parsedDate =
      typeof dateInput === "string"
        ? new Date(dateInput.replace(/-/g, "/"))
        : dateInput;
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date for API:", error);
    return "";
  }
};

function TablaContabilidadVentas({ periodo }: Props = { periodo: "" }) {
  const { data, isLoading, isError } = useContabilidadVentasLista(periodo);
  const { mutateAsync: syncData } = useSyncbContabilidadVentas(periodo);
  const { mutateAsync: deleteItems } = useDeleteContabilidadVentas();

  const totals = useMemo(() => {
    if (!data) return { base: 0, igv: 0, total: 0 };
    return data.reduce(
      (acc, item) => ({
        base: acc.base + (item.base_imponible || 0),
        igv: acc.igv + (item.igv || 0),
        total: acc.total + (item.total || 0),
      }),
      { base: 0, igv: 0, total: 0 },
    );
  }, [data]);

  const handleSync = async (payload: {
    created: RowTableVentas[];
    updates: RowTableVentas[];
  }) => {
    const formattedPayload = {
      created: payload.created
        .filter((row) => {
          const hasRequiredText =
            !!row.periodo &&
            !!row.fecha_inicio &&
            !!row.fecha_fin &&
            !!row.tipo_comp?.trim() &&
            !!row.serie_comp?.trim() &&
            !!row.numero_comp?.trim() &&
            !!row.nombre_empresa?.trim();

          
          const baseNum = Number(row.base_imponible);
          const igvNum = Number(row.igv);
          const totalNum = Number(row.total);

          const hasRequiredNumbers =
            !isNaN(baseNum) && !isNaN(igvNum) && !isNaN(totalNum);

          return hasRequiredText && hasRequiredNumbers;
        })
        .map((row) => ({
          periodo: row.periodo,
          fecha_emision: safeFormatToApi(row.fecha_inicio), // ◄ Modificado con date-fns
          fecha_vencimiento: safeFormatToApi(row.fecha_fin), // ◄ Modificado con date-fns
          tipo_cp_codigo: row.tipo_comp.trim(),
          serie: row.serie_comp.trim(),
          numero: row.numero_comp.trim(),
          tipo_documento: row.tipo_empresa.trim() || null,
          nro_documento: row.numero_empresa.trim() || null,
          razon_social: row.nombre_empresa.trim() || null,
          base_imponible: Number(row.base_imponible) || 0,
          igv: Number(row.igv) || 0,
          total: Number(row.total) || 0,
          moneda: row.moneda.trim(),
          tipo_cambio: Number(row.tipo_cambio) || 0,
          categoria: row.categoria.trim() || null,
          descripcion_comprobante: row.descripcion?.trim() || null,
          monto_retencion: row.monto_retencion || 0,
          monto_detraccion: row.monto_detraccion || 0,
          is_active: row.is_active.trim() || "1",
          link_pdf: row.link_pdf || null,
        })),

      updates: payload.updates.map((row) => ({
        id: row.id,
        periodo: row.periodo,
        fecha_emision: safeFormatToApi(row.fecha_inicio), // ◄ Modificado con date-fns
        fecha_vencimiento: safeFormatToApi(row.fecha_fin), // ◄ Modificado con date-fns
        tipo_cp_codigo: row.tipo_comp.trim(),
        serie: row.serie_comp.trim(),
        numero: row.numero_comp.trim(),
        tipo_documento: row.tipo_empresa.trim() || null,
        nro_documento: row.numero_empresa.trim() || null,
        razon_social: row.nombre_empresa.trim() || null,
        base_imponible: Number(row.base_imponible) || 0,
        igv: Number(row.igv) || 0,
        total: Number(row.total) || 0,
        moneda: row.moneda.trim(),
        tipo_cambio: Number(row.tipo_cambio) || 0,
        categoria: row.categoria.trim() || null,
        descripcion_comprobante: row.descripcion?.trim() || null,
        monto_retencion: row.monto_retencion || 0,
        monto_detraccion: row.monto_detraccion || 0,
        is_active: row.is_active.trim() || "1",
        link_pdf: row.link_pdf || null,
      })),
    };
    await syncData(formattedPayload);
  };

  const columnsExcel = [
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

  return (
    <TablaGridBaseVentas
      data={data}
      isLoading={isLoading}
      isError={isError}
      totalBaseImponible={totals.base}
      totalIgv={totals.igv}
      totalTotal={totals.total}
      moneda="S/"
      excelFileName={periodo}
      deleteItems={deleteItems}
      mapDataApi={mapDataApi}
      getColumns={getColumns}
      createEmptyRow={createEmptyRow}
      rowProcessor={rowProcessor}
      syncData={handleSync}
      columnsExcel={columnsExcel}
    />
  );
}

export default TablaContabilidadVentas;
