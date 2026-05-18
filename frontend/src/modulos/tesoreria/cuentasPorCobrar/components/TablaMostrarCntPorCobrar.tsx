import { useMemo } from "react";
import {
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import {
  sortingFns,
  type ColumnDef,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
// Nota: Reemplazar por tu custom hook real de cuentas por pagar cuando exista en tu API
import { useCuentasPorCobrarResumenMensualCaja } from "../data/api.CntsCobrarTableReporte";
import type { ReporteCntsPorCobrarSchemaApiType } from "../data/api.schemaCntsCobrarTableReporte";
import { TableBaseFuzzyCntasPorCobrar } from "./TablaBaseTsKFilterPaginacion";

export interface DataTableCntsPorPagar {
  key: number;
  id: number;
  fecha_emision: string | Date;
  fecha_vencimiento: string | Date;
  nro_documento: string;
  cliente_razon_social: string;
  total: number;
  moneda: string;
  tipo_cambio: number;
  fecha_pago: string | Date | null;
  monto_pagado: number;
  status_pago: string;
  link_pdf: string;
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

const mapDataTable = (
  data: ReporteCntsPorCobrarSchemaApiType[],
): DataTableCntsPorPagar[] => {
  return data.map((item, index) => ({
    key: index + 1,
    id: item.id,
    fecha_emision: item.fecha_emision || "-",
    fecha_vencimiento: item.fecha_vencimiento || "-",
    nro_documento: item.nro_documento || "-",
    cliente_razon_social: item.razon_social || "-",
    total: item.total / item.tipo_cambio || 0,
    moneda: item.moneda || "-",
    tipo_cambio: item.tipo_cambio || 0,
    fecha_pago: item.fecha_pago || null,
    monto_pagado: item.monto_pagado || 0,
    status_pago: item.status_cobro || "-",
    link_pdf: item.link_pdf || "-",
  }));
};


// componente para dar estilo a los datos de las columnas
const StyleDataCell = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="text-xs">
      {children}
    </span>
  )
}


function TablaMostrarCntPorCobrar() {
  // 1. Obtención de datos desde la API
  const {
    data: apiData,
    isLoading,
    isError,
  } = useCuentasPorCobrarResumenMensualCaja("202501");

  // 2. Mapeo y transformación profesional de Datos para Adaptar los Tipos
  const tableData = useMemo(() => {
    if (!apiData) return [];
    return mapDataTable(apiData);
  }, [apiData]);

  // Formateador auxiliar de Moneda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "PEN",
    }).format(amount);
  };

  // Formateador auxiliar de Fechas
  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("es-PE", { timeZone: "UTC" });
  };

  // 3. Definición de Columnas (apuntando a los nuevos campos mapeados)
  const columns = useMemo<ColumnDef<DataTableCntsPorPagar, any>[]>(
    () => [
      {
        accessorKey: "key",
        header: () => <span className="font-bold">Nro</span>,
        cell: (info) => (
          <StyleDataCell>{info.getValue()}</StyleDataCell>
        ),
        filterFn: "equalsString",
      },
      {
        accessorKey: "fecha_emision",
        header: () => (
          <span className="flex items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Emisión
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
        
      },
      {
        accessorKey: "fecha_vencimiento",
        header: () => (
          <span className="flex items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Venc.
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "nro_documento",
        header: () => (
          <span className="flex items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> N° Documento
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{info.getValue()}</StyleDataCell>
        ),
      },
      {
        accessorKey: "cliente_razon_social",
        header: () => (
          <span className="flex items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Cliente
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{info.getValue()}</StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "total",
        header: () => (
          <span className="flex items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Total
          </span>
        ),
        cell: (info) =>
          <StyleDataCell>{formatCurrency(info.getValue(), info.row.original.moneda)}</StyleDataCell>,
      },
      {
        accessorKey: "fecha_pago",
        header: () => (
          <span className="flex items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Pago
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "monto_pagado",
        header: () => (
          <span className="flex items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> M. Pagado
          </span>
        ),
        cell: (info) =>(
          <StyleDataCell> {
          formatCurrency(info.getValue(), info.row.original.moneda)}
          </StyleDataCell>
        )
      },
      {
        accessorKey: "status_pago", // Ahora coincide perfectamente gracias al map
        header: () => (
          <span className="flex items-center gap-1">
            <IoCheckmarkCircleOutline className="text-gray-500" /> Estado
          </span>
        ),
        cell: (info) => {
          const estado = info.getValue()?.toLowerCase();
          const badgeStyles =
            estado === "parcial" ||
            estado === "parcial" ||
            estado === "pendiente"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-yellow-100 text-yellow-800 border-yellow-200";
          return (
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badgeStyles}`}
            >
              {info.getValue()}
            </span>
          );
        },
      },
      {
        accessorKey: "link_pdf",
        header: () => (
          <span className="flex items-center gap-1">
            <IoDocumentTextOutline className="text-gray-500" /> PDF
          </span>
        ),
        cell: (info) => (
          <div className="flex justify-center">
            <a href={info.getValue()} target="_blank" rel="noopener noreferrer">
              <IoDocumentTextOutline size={14} className="hover:text-red-700" />
            </a>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      },
    ],
    [],
  );

  if (isLoading)
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando cuentas por pagar...
      </div>
    );
  if (isError)
    return <div className="p-6 text-center text-red-500">{isError}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-58px)] w-full gap-1 bg-gray-50/50">
      <header className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
          Control de Cuentas por Cobrar
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Gestión de derechos de cobros a clientes
        </p>
      </header>

      <main className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
        <div className="overflow-x-auto h-full">
          <TableBaseFuzzyCntasPorCobrar<DataTableCntsPorPagar>
            data={tableData}
            columns={columns}
            fuzzyFilter={fuzzyFilter}
          />
        </div>
      </main>
    </div>
  );
}

export default TablaMostrarCntPorCobrar;
