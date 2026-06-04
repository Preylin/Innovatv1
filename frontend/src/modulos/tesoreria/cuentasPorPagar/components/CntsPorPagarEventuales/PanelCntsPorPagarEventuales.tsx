import { useMemo, useState } from "react";
import {
  IoCalendarOutline,
  IoPersonOutline,
  IoWalletOutline,
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
import { App, Button, Popconfirm, Tooltip } from "antd";
import { differenceInCalendarDays, isValid } from "date-fns";
import { TbReplaceFilled } from "react-icons/tb";
import { LuSquareCheckBig } from "react-icons/lu";
import { SkeletonHeaderTable } from "../../../../../components/skeleton/SkeletonHeaderTable";
import { ApiErrorDisplay } from "../../../../../components/Error/ApiErrorDisplay";
import { TableBaseFuzzyCntasPorCobrar } from "../../../../../components/tanstack-table/TablaBaseTsKFilterPaginacion";
import { useToggle, useUpdateModal } from "../../../../../hooks/Toggle";
import { FormNuevaObligacionEventual } from "./ModalRegistrarEvent";
import {
  useCuentasPorPagarEventualList,
  useDeleteRegistoEventuales,
} from "../../data/api.cuentasPorPagar";
import type { CuentasPorPagarEventualResumenMensualSchemaApiOutType } from "../../data/api.shemaCuentasPorCobar";
import ModalRegistroCntsPorPagarEventuales from "./ModalRegistroPagoEventuales";
import { ModalEditarCntsPagarEventuales } from "./EditarRegistrosCntPagarEvent";
import { MdDeleteForever } from "react-icons/md";

export interface DataTableCntsPorPagar {
  key: number;
  id: number;
  fecha_emision: string | Date;
  fecha_vencimiento: string | Date;
  entidad: string;
  detalle: string;
  status_fecha: string;
  total_exigible: number;
  total: number;
  moneda: string;
  status_pago: string;
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

  // 1. Convertir la fecha de vencimiento a un objeto Date (JS la leerá como UTC si viene con guiones)
  const fechaVencimiento = new Date(fechaVencimientoRaw);
  if (!isValid(fechaVencimiento)) return "Fecha Inválida";

  // 2. Obtener el 'Hoy' real en Perú, pero forzado a las 00:00:00 en formato UTC
  // Esto simula que "Hoy" también es una fecha pura del backend sin hora.
  const hoyLocal = new Date();
  const hoyUTC = new Date(
    Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()),
  );

  // 3. Extraer solo los componentes de Año, Mes y Día en formato UTC de la fecha de vencimiento.
  // Así eliminamos cualquier hora residual (como si viniera de un campo DateTime con horas)
  const vencimientoUTC = new Date(
    Date.UTC(
      fechaVencimiento.getUTCFullYear(),
      fechaVencimiento.getUTCMonth(),
      fechaVencimiento.getUTCDate(),
    ),
  );

  // 4. Calculamos la diferencia exacta de días comparando UTC contra UTC
  const dias = differenceInCalendarDays(vencimientoUTC, hoyUTC);

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
  data: CuentasPorPagarEventualResumenMensualSchemaApiOutType[],
): DataTableCntsPorPagar[] => {
  return data.map((item, index) => {
    const textoStatusFecha = obtenerTextoAlertaVencimiento(
      item.fecha_vencimiento,
      item.status_cobro || "-",
    );

    const Total = item.monto_esperado || 0;
    const Pagado = item.monto_pagado || 0;
    const MontoPorPagar = Total - Pagado;

    return {
      key: index + 1,
      id: item.id,
      fecha_emision: item.fecha_emision || "-",
      fecha_vencimiento: item.fecha_vencimiento || "-",
      status_fecha: textoStatusFecha,
      entidad: item.empresa || "-",
      detalle: item.detalle || "-",
      total: MontoPorPagar,
      total_exigible: Total,
      moneda: item.moneda || "-",
      status_pago: item.status_cobro || "-",
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

function CuentasPorPagarEventuales() {
  const [selectedCobroId, setSelectedCobroId] = useState<number | null>(null);
  const [selectedTotal, setSelectedTotal] = useState<number | null>(null);
  const [selectedMoneda, setSelectedMoneda] = useState<string | null>(null);
  const ModalRegistrarDeuda = useToggle();
  const ModalEditar = useUpdateModal<number>();
  const { mutate } = useDeleteRegistoEventuales();
  const { message } = App.useApp();

  const [selectDay, setSelectDay] = useState<string>("");

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
  } = useCuentasPorPagarEventualList();

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
        accessorKey: "entidad",
        size: 200,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Proveedor
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
        accessorKey: "detalle",
        size: 300,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            <IoPersonOutline className="text-gray-500" /> Detalle
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
        accessorKey: "moneda",
        size: 65,
        meta: { textAlign: "center", filterVariant: "select" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Moneda
          </span>
        ),
        cell: (info) => <StyleDataCell>{info.getValue() || "-"}</StyleDataCell>,
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "actions",
        size: 70,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Acciones
          </span>
        ),
        cell: (info) => (
          <div className="flex flex-row gap-2 items-center justify-center">
            <Tooltip title="Realizar Pago">
              <button
                className="cursor-pointer hover:text-cyan-500"
                onClick={() => {
                  setSelectedCobroId(info.row.original.id);
                  setSelectDay(info.row.original.status_fecha);
                  setSelectedTotal(info.row.original.total_exigible);
                  setSelectedMoneda(info.row.original.moneda);
                }}
              >
                <LuSquareCheckBig fontSize={16} />
              </button>
            </Tooltip>
            <Tooltip title="Actualizar">
              <button
                className="cursor-pointer hover:text-orange-500"
                onClick={() => ModalEditar.handlerOpen(info.row.original.id)}
              >
                <TbReplaceFilled fontSize={16} />
              </button>
            </Tooltip>
            <Tooltip title="Eliminar" placement="left">
              <Popconfirm
                title="¿Eliminar?"
                placement="left"
                onConfirm={() =>
                  mutate(info.row.original.id, {
                    onSuccess: () => message.success("Eliminado"),
                  })
                }
              >
                <MdDeleteForever
                  fontSize={16}
                  className="cursor-pointer hover:text-red-500"
                />
              </Popconfirm>
            </Tooltip>
          </div>
        ),
        enableColumnFilter: false,
        enableSorting: false,
      },
    ],
    [],
  );

  const columnsExcel = [
      {
        header: "Nro.",
        key: "key",
        width: 5,
      },
      {
        header: "F. Emisión",
        key: "fecha_emision",
        width: 15,
      },
      {
        header: "F. Venc.",
        key: "fecha_vencimiento",
        width: 15,
      },
      {
        header: "Estado Venc.",
        key: "status_fecha",
        width: 20,
      },
      {
        header: "Proveedor",
        key: "entidad",
        width: 30,
      },
      {
        header: "Detalle",
        key: "detalle",
        width: 30,
      },
      {
        header: "Total",
        key: "total",
        width: 10,
      },
      {
        header: "Cobro",
        key: "status_pago",
        width: 10,
      },
      {
        header: "Moneda",
        key: "moneda",
        width: 10,
      },
    ];

  if (isLoading) return <SkeletonHeaderTable loading={isLoading} />;

  if (isError) return <ApiErrorDisplay error={error} />;



  return (
    <div className="flex flex-col w-full h-[calc(100vh-58px)] gap-2">
      <header className=" px-2 flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-mist-50 italic uppercase">
            Obligaciones <span className="text-red-400">Eventuales</span>
          </h2>
        </div>

        <div className=" bg-mist-100 p-2 rounded-md shadow-md shadow-mist-300">
          <Button type="primary" onClick={ModalRegistrarDeuda.toggle}>
            Nuevo
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto w-full">
        <TableBaseFuzzyCntasPorCobrar<DataTableCntsPorPagar>
          data={tableData}
          columns={columns}
          fuzzyFilter={fuzzyFilter}
          columFiltersInitialValue={columnFilters}
          cantidadFilas={13}
          excelFileName="Obligaciones Eventuales"
          columnsExcel={columnsExcel}
        />
      </main>
      {selectedCobroId !== null && (
        <ModalRegistroCntsPorPagarEventuales
          id={selectedCobroId}
          open={selectedCobroId !== null}
          totalMaximo={selectedTotal || 0}
          moneda={selectedMoneda || "-"}
          onClose={() => setSelectedCobroId(null)}
          day={selectDay}
        />
      )}

      {ModalRegistrarDeuda && (
        <FormNuevaObligacionEventual
          open={ModalRegistrarDeuda.isToggled}
          onClose={ModalRegistrarDeuda.toggle}
        />
      )}

      <ModalEditarCntsPagarEventuales
        id={ModalEditar.data ?? 0}
        open={ModalEditar.isToggled}
        onClose={ModalEditar.handlerClose}
      />
    </div>
  );
}

export default CuentasPorPagarEventuales;
