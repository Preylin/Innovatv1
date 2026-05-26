import { useMemo, useState } from "react";
import {
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoStopwatchOutline,
} from "react-icons/io5";
import {
  sortingFns,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
// Nota: Reemplazar por tu custom hook real de cuentas por pagar cuando exista en tu API
import { useCuentasPorCobrarResumenMensualCaja } from "../data/api.CntsCobrarTableReporte";
import type { ReporteCntsPorCobrarSchemaApiType } from "../data/api.schemaCntsCobrarTableReporte";
import { TableBaseFuzzyCntasPorCobrar } from "../../../../components/tanstack-table/TablaBaseTsKFilterPaginacion";
import { Select, Tooltip } from "antd";
import { useYearsContabilidadVentas } from "../../../contabilidad/ventas/data/api.ventas/api.smallConsultas";
import { differenceInCalendarDays, isValid } from "date-fns";
import { ModalRegistroCntsPorCobrar } from "./ModalRegistroCobro";
import FloatingWindowButton from "./ejemplowindos";
import { LuListCheck } from "react-icons/lu";
import { ApiErrorDisplay } from "../../../../components/Error/ApiErrorDisplay";
import { SkeletonHeaderTable } from "../../../../components/skeleton/SkeletonHeaderTable";

export interface DataTableCntsPorPagar {
  key: number;
  id: number;
  fecha_emision: string | Date;
  fecha_vencimiento: string | Date;
  documento: string;
  nro_documento: string;
  cliente_razon_social: string;
  status_fecha: string; // Días restantes o de retraso
  total: number;
  monto_pagado: number;
  monto_detraccion: number;
  monto_retencion: number;
  moneda: string;
  tipo_cambio: number;
  fecha_pago_detraccion_retencion: string | Date | null;
  status_pago: string;
  link_pdf: string;
}

const format = new Intl.NumberFormat("es-PE", {});

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

function obtenerTextoAlertaVencimiento(
  fechaVencimientoRaw: Date | string | null | undefined,
  statusPago: string,
): string {
  if (statusPago === "CANCELADO") return "Completado";
  if (!fechaVencimientoRaw || fechaVencimientoRaw === "-") return "Sin Fecha";

  const fechaVencimiento = new Date(fechaVencimientoRaw);
  if (!isValid(fechaVencimiento)) return "Fecha Inválida";

  const fechaActual = new Date();
  const dias = differenceInCalendarDays(fechaVencimiento, fechaActual);

  if (dias > 0) {
    return `Faltan ${dias} ${dias === 1 ? "día" : "días"}`;
  } else if (dias === 0) {
    return "Vence Hoy";
  } else {
    const diasRetraso = Math.abs(dias);
    return `Vencido (${diasRetraso} ${diasRetraso === 1 ? "día" : "días"})`;
  }
}

const mapDataTable = (
  data: ReporteCntsPorCobrarSchemaApiType[],
): DataTableCntsPorPagar[] => {
  return data.map((item, index) => {
    // 🚀 Inyectamos el string generado directamente en el modelo de datos
    const textoStatusFecha = obtenerTextoAlertaVencimiento(
      item.fecha_vencimiento,
      item.status_cobro || "-",
    );

    return {
      key: index + 1,
      id: item.id,
      fecha_emision: item.fecha_emision || "-",
      fecha_vencimiento: item.fecha_vencimiento || "-",
      documento: `${item.serie || "-"}-${item.numero || "-"}`,
      status_fecha: textoStatusFecha,
      nro_documento: item.nro_documento || "-",
      cliente_razon_social: item.razon_social || "-",
      total: item.total / item.tipo_cambio || 0,
      monto_pagado: item.monto_pagado || 0,
      monto_detraccion: item.monto_detraccion || 0,
      monto_retencion: item.monto_retencion || 0,
      fecha_pago_detraccion_retencion:
        item.fecha_pago_detraccion_retencion || "-",
      moneda: item.moneda || "-",
      tipo_cambio: item.tipo_cambio || 1,
      status_pago: item.status_cobro || "-",
      link_pdf: item.link_pdf || "-",
    };
  });
};

interface PropsComponent {
  children: React.ReactNode;
  className?: string;
}

// componente para dar estilo a los datos de las columnas
const StyleDataCell: React.FC<PropsComponent> = ({ children, className }) => {
  return (
    <span
      className={`text-[8px] md:text-[10px] text-center block ${className}`}
    >
      {children}
    </span>
  );
};

const dateFilterFn: FilterFn<DataTableCntsPorPagar> = (
  row,
  columnId,
  filterValue,
) => {
  const cellValue = row.getValue(columnId);
  if (!filterValue || filterValue === "") return true;

  if (!cellValue) return false;

  const d = new Date(cellValue as string | Date);
  if (isNaN(d.getTime())) return false;

  const formattedCellDate = d.toLocaleDateString("es-PE", { timeZone: "UTC" });

  return formattedCellDate
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const numericFilterFn: FilterFn<DataTableCntsPorPagar> = (
  row,
  columnId,
  filterValue,
) => {
  const cellValue = row.getValue(columnId);
  if (filterValue === "" || filterValue === undefined) return true;
  return String(cellValue)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const formatPEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});
const formatUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function TablaMostrarCntPorCobrar() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(year.toString());
  // const [selectedYear, setSelectedYear] = useState<string>("2025");

  const [selectedCobroId, setSelectedCobroId] = useState<number | null>(null);
  const [selectDay, setSelectDay] = useState<string>("");

  const { data: years } = useYearsContabilidadVentas();

  const [columnFilters] = useState<ColumnFiltersState>([
    {
      id: "status_pago",
      value: "PENDIENTE",
    },
  ]);

  const {
    data: apiData,
    isLoading,
    isError,
    error,
  } = useCuentasPorCobrarResumenMensualCaja(selectedYear);

  const tableData = useMemo(() => {
    if (!apiData) return [];
    return mapDataTable(apiData);
  }, [apiData]);

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

  //usememo para cualcular datos para panel resumen para soles y dolares para status pendiente por vencer y vencidas solo considerar datos (total, monto_pagado, tipo_cambio)

  const summaryPanel = useMemo(() => {
    // Inicializamos nuestra estructura de acumuladores
    const summary = {
      PEN: {
        CantidadVencer: 0,
        CantidadVencido: 0,
        porVencer: 0,
        vencido: 0,
        total: 0,
      },
      USD: {
        CantidadVencer: 0,
        CantidadVencido: 0,
        porVencer: 0,
        vencido: 0,
        total: 0,
      },
    };

    if (!apiData) return summary;

    const hoy = new Date();

    return apiData.reduce((acc, item) => {
      const TotalDetraccion = item?.monto_detraccion || 0;
      const TotalRetencion = item?.monto_retencion || 0;
      const TotalDescuento = TotalDetraccion + TotalRetencion;

      const Total = item?.total || 0;
      const TipoCambio = item?.tipo_cambio || 1;

      const TotalDescontado = Total - TotalDescuento;

      const PagoMaximo = TotalDescontado / TipoCambio;

      // Paso 1: Solo considerar status_cobro "PENDIENTE"
      if (item.status_cobro !== "PENDIENTE") return acc;

      // Identificar la moneda (solo manejamos PEN y USD según tu requerimiento)
      const moneda = item.moneda as "PEN" | "USD";
      if (!acc[moneda]) return acc; // Por si llega otra moneda que no sea PEN o USD

      // Paso 2: Calcular el saldo pendiente real de este documento
      const saldoPendiente = PagoMaximo - (item.monto_pagado || 0);

      // Paso 3: Clasificar por fecha de vencimiento
      const fechaVencimiento = new Date(item.fecha_vencimiento);

      if (fechaVencimiento >= hoy) {
        // Pendiente por vencer
        acc[moneda].porVencer += saldoPendiente;
        acc[moneda].CantidadVencer += 1;
      } else {
        // Vencida
        acc[moneda].vencido += saldoPendiente;
        acc[moneda].CantidadVencido += 1;
      }

      // calcular total
      acc[moneda].total += saldoPendiente;

      return acc;
    }, summary);
  }, [apiData]);

  // 3. Definición de Columnas (apuntando a los nuevos campos mapeados)
  const columns = useMemo<ColumnDef<DataTableCntsPorPagar, any>[]>(
    () => [
      {
        accessorKey: "key",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Nro.
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "fecha_emision",
        size: 100,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Emisión
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "fecha_vencimiento",
        size: 100,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoCalendarOutline className="text-gray-500" /> F. Venc.
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "status_fecha",
        size: 100,
        // 🚀 Cambiado a text para que busque coincidencias de caracteres ("Vencido", "Faltan", "Hoy")
        filterFn: "includesString",
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoStopwatchOutline className="text-gray-500" /> Estado Venc.
          </span>
        ),
        cell: (info) => {
          const textoEstado = String(info.getValue());

          // Evaluamos el contenido del string para aplicar los colores de Tailwind
          if (textoEstado === "Completado") {
            return (
              <div className="flex justify-center">
                <span className="p-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Completado
                </span>
              </div>
            );
          }

          if (textoEstado === "Vence Hoy") {
            return (
              <div className="flex justify-center">
                <span className="p-1 text-[8px] md:text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                  Vence Hoy
                </span>
              </div>
            );
          }

          if (textoEstado.startsWith("Faltan")) {
            return (
              <div className="flex justify-center">
                <span className="p-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-green-50 text-green-700 border border-green-200">
                  {textoEstado}
                </span>
              </div>
            );
          }

          if (textoEstado.startsWith("Vencido")) {
            return (
              <div className="flex justify-center">
                <span className="p-1 text-[8px] md:text-[10px] font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
                  {textoEstado}
                </span>
              </div>
            );
          }

          // Caso de "Sin Fecha" o "Fecha Inválida"
          return (
            <div className="flex justify-center text-[8px] md:text-[10px] text-gray-400 italic">
              {textoEstado}
            </div>
          );
        },
      },
      {
        accessorKey: "documento",
        size: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Documento
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "nro_documento",
        size: 100,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoReceiptOutline className="text-gray-500" /> RUC
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue()}</StyleDataCell>,
      },
      {
        accessorKey: "cliente_razon_social",
        size: 300,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Cliente
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
        footer: () => (
          <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
            TOTAL:
          </span>
        ),
      },
      {
        accessorKey: "total",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Total
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {formatCurrency(info.getValue(), info.row.original.moneda)}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("total")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {format.format(totalFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "status_pago",
        meta: { filterVariant: "select", textAlign: "left" },
        size: 100,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1 w-full justify-center">
            <IoCheckmarkCircleOutline className="text-gray-500" /> Cobro
          </span>
        ),
        cell: (info) => {
          const valorOriginal = info.getValue() || "PENDIENTE";
          const estado = valorOriginal.toLowerCase();

          const badgeStyles =
            estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : estado === "cancelado"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-800";

          return (
            <span
              className={`flex items-center px-2 py-1 text-[8px] md:text-[10px] justify-center font-semibold rounded-md ${badgeStyles}`}
            >
              {valorOriginal}
            </span>
          );
        },
      },
      {
        accessorKey: "link_pdf",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoDocumentTextOutline className="text-gray-500" /> PDF
          </span>
        ),
        cell: (info) => {
          const valor = info.getValue();
          const styles =
            valor !== "-" ? " text-teal-500" : "text-red-800 hidden";
          return (
            <div className="flex justify-center">
              <a
                href={info.getValue()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoDocumentTextOutline
                  size={14}
                  className={` ${styles} rounded-md text-center `}
                />
              </a>
            </div>
          );
        },
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "monto_detraccion",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Detracción
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
            }).format(info.getValue())}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalPagadoFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("monto_detraccion")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {formatPEN.format(totalPagadoFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "monto_retencion",
        size: 100,
        filterFn: numericFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoWalletOutline className="text-gray-500" /> Retención
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-end">
            {new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
            }).format(info.getValue())}
          </StyleDataCell>
        ),
        footer: ({ table }) => {
          const totalPagadoFiltrado = table
            .getFilteredRowModel()
            .rows.reduce((sum, row) => {
              return sum + (Number(row.getValue("monto_retencion")) || 0);
            }, 0);

          return (
            <span className="text-[8px] md:text-[10px] font-extrabold text-gray-900 block w-full text-end">
              {formatPEN.format(totalPagadoFiltrado)}
            </span>
          );
        },
      },
      {
        accessorKey: "fecha_pago_detraccion_retencion",
        size: 80,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <Tooltip title={"Fecha de Pago de Detracción o Retención"}>
            <span className="flex text-[8px] md:text-[10px] items-center gap-1">
              <IoCalendarOutline className="text-gray-500" /> F. Pago
            </span>
          </Tooltip>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "actions",
        size: 50,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Acción
          </span>
        ),
        cell: (info) => (
          <div className="flex justify-center">
            <button
              className="cursor-pointer hover:text-cyan-500"
              onClick={() => {
                setSelectedCobroId(info.row.original.id);
                setSelectDay(info.row.original.status_fecha);
              }}
            >
              <LuListCheck fontSize={16} />
            </button>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      },
    ],
    [],
  );

  if (isLoading) return <SkeletonHeaderTable loading={isLoading} />;

  if (isError) return <ApiErrorDisplay error={error} />;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-58px)] gap-1">
      <header className="bg-white p-2 rounded-md shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Control de Cuentas por Cobrar
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestión de derechos de cobros a clientes
          </p>
        </div>

        <div className="flex flex-row items-center gap-2">
          <Select
            className="w-30"
            placeholder="Año"
            value={selectedYear}
            onChange={setSelectedYear}
            options={years?.map((y) => ({ value: y, label: y }))}
          />
          <FloatingWindowButton
            titleButtom="Resumen"
            titleWindow="Resumen de cuentas por cobrar"
            heightWindow={250}
            children={
              <div className="p-1 w-full scroll-auto overflow-auto">
                <table className="w-full text-[11px] text-slate-600 border-collapse">
                  <thead>
                    <tr className=" bg-mist-500 font-semibold uppercase tracking-wider text-mist-50">
                      <th className="p-4 text-left font-medium">Concepto</th>
                      <th className="p-4 text-right font-medium">
                        Soles (PEN)
                      </th>
                      <th className="p-4 text-right font-medium">
                        Dólares (USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {/* Fila: Por Vencer */}
                    <tr className="hover:bg-mist-200 transition-colors">
                      <td className="p-4 text-left font-sans font-medium text-slate-700 capitalize">
                        Por vencer
                      </td>
                      <td className="p-4 text-right text-emerald-600 font-semibold">
                        <div>
                          {summaryPanel.PEN.CantidadVencer}{" "}
                          {formatPEN.format(summaryPanel.PEN.porVencer)}
                        </div>
                      </td>
                      <td className="p-4 text-right text-emerald-600 font-semibold">
                        <div>
                          {summaryPanel.USD.CantidadVencer}{" "}
                          {formatUSD.format(summaryPanel.USD.porVencer)}
                        </div>
                      </td>
                    </tr>

                    {/* Fila: Vencido */}
                    <tr className="hover:bg-mist-200 transition-colors">
                      <td className="p-4 text-left font-sans font-medium text-slate-700 capitalize">
                        Vencido
                      </td>
                      <td className="p-4 text-right text-rose-600 font-semibold">
                        <div>
                          {summaryPanel.USD.CantidadVencido}{" "}
                          {formatPEN.format(summaryPanel.USD.vencido)}
                        </div>
                      </td>
                      <td className="p-4 text-right text-rose-600 font-semibold">
                        <div>
                          {summaryPanel.USD.CantidadVencido}{" "}
                          {formatUSD.format(summaryPanel.USD.vencido)}
                        </div>
                      </td>
                    </tr>

                    {/* Fila: Total General */}
                    <tr className="bg-mist-300 font-bold border-t-2 border-slate-200">
                      <td className="p-4 text-left text-slate-900 uppercase tracking-wider">
                        Total Pendiente
                      </td>
                      <td className="p-4 text-right text-slate-950 border-t border-slate-200">
                        {formatPEN.format(summaryPanel.PEN.total)}
                      </td>
                      <td className="p-4 text-right text-slate-950 border-t border-slate-200">
                        {formatUSD.format(summaryPanel.USD.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          />
        </div>
      </header>

      <main className="bg-white rounded-md shadow-sm border border-gray-100 flex-1 overflow-auto w-full">
        <TableBaseFuzzyCntasPorCobrar<DataTableCntsPorPagar>
          data={tableData}
          columns={columns}
          fuzzyFilter={fuzzyFilter}
          columFiltersInitialValue={columnFilters}
          cantidadFilas={10}
        />
      </main>
      {selectedCobroId !== null && (
        <ModalRegistroCntsPorCobrar
          id={selectedCobroId}
          open={selectedCobroId !== null}
          onClose={() => setSelectedCobroId(null)}
          day={selectDay}
        />
      )}
    </div>
  );
}

export default TablaMostrarCntPorCobrar;
