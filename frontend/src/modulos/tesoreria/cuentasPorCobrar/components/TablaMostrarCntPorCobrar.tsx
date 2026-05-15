import { useMemo, type ReactNode } from "react";
import {
  IoCalendarOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { TableBaseFuzzyCntasPorCobrar } from "./TablaBaseTsKFilterPaginacion";
import {
  sortingFns,
  type ColumnDef,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import type { DataTableCntsPorCobrar } from "../types/typesCntPorCobarTable";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { useCuentasPorCobrarResumenMensualCaja } from "../data/api.CntsCobrarTableReporte";

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!,
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

// // 2. Data con iconos corregidos y coherentes
// const HEADER_COLUMNS: HeaderColumn[] = [
//   { title: "Fecha Emisión", icon: <IoCalendarOutline /> },
//   { title: "Fecha Vencimiento", icon: <IoCalendarOutline /> },
//   { title: "Factura", icon: <IoReceiptOutline /> },
//   { title: "Cliente", icon: <IoPersonOutline /> },
//   { title: "Total", icon: <IoWalletOutline /> },
//   { title: "Fecha Pago", icon: <IoCalendarOutline /> },
//   { title: "Monto Pagado", icon: <IoWalletOutline /> },
//   { title: "Estado", icon: <IoCheckmarkCircleOutline /> },
//   { title: "Ver PDF", icon: <IoDocumentTextOutline /> },
// ];

function TablaMostrarCntPorPagar() {

    const {data, isLoading, isError} = useCuentasPorCobrarResumenMensualCaja("202501");
    console.log(data);


  const columns = useMemo<ColumnDef<DataTableCntsPorCobrar, any>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <span>ID</span>,
        id: "id",
        cell: (info) => info.getValue(),
        filterFn: "equalsString",
        sortingFn: sortingFns.alphanumeric,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-58px)] w-full gap-1 ">
      {/* Header del módulo */}
      <header className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Cuentas por Cobrar
        </h2>
      </header>

      {/* Contenedor de la tabla (Soporta scroll horizontal si es necesario) */}
      <main className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {/* <TableBaseFuzzyCntasPorCobrar<DataTableCntsPorCobrar>  fuzzyFilter={fuzzyFilter} /> */}
        </div>
      </main>
    </div>
  );
}

export default TablaMostrarCntPorPagar;
