import { useState, useMemo } from "react";

import {
  Button,
  Modal,
  Popconfirm,
  Skeleton,
} from "antd";
import type { ChipServicioOutApiType } from "../../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api.schema";
import {
  useChipServicioList,
  useDeleteChipServicio,
} from "../../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api";
import isoToDDMMYYYY from "../../../../../helpers/Fechas";
import { ordenarPorFecha } from "../../../../../helpers/OrdenacionAscDscPorFechasISO";
import ErrorResultServer from "../../../../../components/pages/resultado/ErrorResultServer";
import ButtomNew from "../../../../../components/molecules/botons/BottomNew";
import ButtonUpdate from "../../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../../components/molecules/botons/BottonDelete";
import ModalCrearChipServicio from "./ModalCrearRegistroServicioChip";
import ModalUpdateChipServicio from "./ActualizarRegistroChipServicio";
import Showchips from "../inventario/MostrarRegistrosChips";
import ButtonWatch from "../../../../../components/molecules/botons/BottonWatch";
import { useToggle } from "../../../../../hooks/Toggle";
import HistorialSerivicioChipsModal from "./ModalImportacionSerChips";
import {
  sortingFns,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { TableBaseFuzzyCntasPorCobrar } from "#components/tanstack-table/TablaBaseTsKFilterPaginacion";

interface DataType {
  key: number;
  id: number;
  name: string;
  ubicacion: string;
  numero: string;
  operador: string;
  plan: string;
  inicio: string;
  fin: string;
  fact_rel: string;
  status: string;
  adicional: string;
  created_at: string;
}


function EstadoItem({ status }: { status: number }) {
  switch (status) {
    case 0:
      return "PENDIENTE";
    case 1:
      return "RENOVADO";
    case 2:
      return "NO RENOVADO";
    default:
      return "PENDIENTE";
  }
}

// Mapeo de los datos de la peticion get

const mapChipServicioTable = (
  proData: ChipServicioOutApiType[],
): DataType[] => {
  return proData.map((w, i) => ({
    key: i + 1,
    id: w.id ?? -1,
    name: w.name || "-",
    ubicacion: w.ubicacion || "-",
    numero: w.numero || "-",
    operador: w.operador || "-",
    plan: w.plan || "-",
    inicio: isoToDDMMYYYY(w.inicio) || "-",
    fin: isoToDDMMYYYY(w.fin) || "-",
    fact_rel: w.fact_rel || "-",
    status: EstadoItem({ status: w.status }) || "-",
    adicional: w.adicional || "-",
    created_at: w.created_at || "-",
  }));
};

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

const formatDate = (date: string | Date | null) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("es-PE", { timeZone: "UTC" });
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

const dateFilterFn: FilterFn<DataType> = (row, columnId, filterValue) => {
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

function TablaMostrarRegistrosChipServicio() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openChipsRegistros, setOpenChipsRegistros] = useState(false);
  const handleOpen = () => setOpenChipsRegistros(true);
  const handleClose = () => setOpenChipsRegistros(false);
  const ModalMasivoChips = useToggle();

  //Queries
  const { data, isLoading, isError, error } = useChipServicioList();
  const { mutate, isPending } = useDeleteChipServicio();

  //Memoizacion de datos procesados
  const dataSource = useMemo(() => {
    if (!data) return [];
    const tableData = mapChipServicioTable(data);
    return tableData;
  }, [data]);

  const [columnFilters] = useState<ColumnFiltersState>([
    {
      id: "status",
      value: "PENDIENTE",
    },
  ]);

  //Handlers Modales
  const handleOpenModal = (id: number) => setSelectedUserId(id);
  const handleCloseModal = () => setSelectedUserId(null);

  const columns = useMemo<ColumnDef<DataType, any>[]>(
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
        accessorKey: "name",
        size: 200,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Cliente
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "ubicacion",
        size: 200,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Ubicación
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "numero",
        size: 200,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Número
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "operador",
        size: 100,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Operador
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "plan",
        size: 90,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Plan
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "inicio",
        size: 70,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Fecha de inicio
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "fin",
        size: 70,
        filterFn: dateFilterFn,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Fecha de fin
          </span>
        ),
        cell: (info) => (
          <StyleDataCell>{formatDate(info.getValue())}</StyleDataCell>
        ),
      },
      {
        accessorKey: "fact_rel",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Factura Rel.
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },

      {
        accessorKey: "status",
        meta: { filterVariant: "select", textAlign: "left" },
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1 w-full justify-center">
            Estado
          </span>
        ),
        cell: (info) => {
          const valorOriginal = info.getValue() || "PENDIENTE";
          const estado = valorOriginal.toLowerCase();

          const badgeStyles =
            estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : estado === "renovado"
                ? "bg-green-100 text-green-800"
                : estado === "no renovado"
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
        accessorKey: "adicional",
        size: 200,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Adicional
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-start">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
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
          <div className="flex justify-center gap-2">
            <ButtonUpdate
              style={{ height: "28px" }}
              onClick={() => handleOpenModal(Number(info.row.original.key))}
            />
            <Popconfirm
              title="¿Eliminar Registro?"
              okText="Eliminar"
              cancelText="Cancelar"
              onConfirm={() => mutate(Number(info.row.original.key))}
              okButtonProps={{ loading: isPending }}
            >
              <ButtonDelete style={{ height: "28px" }} />
            </Popconfirm>
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
      header: "N°",
      key: "key",
      width: 5,
    },
    {
      header: "Cliente",
      key: "name",
      width: 20,
    },
    {
      header: "Ubicación",
      key: "ubicacion",
      width: 25,
    },
    {
      header: "Nùmero",
      key: "numero",
      width: 20
    }, 
    {
      header: "Operador",
      key: "operador",
      width: 15,
    },
    {
      header: "Plan",
      key: "plan",
      width: 15,
    },
    {
      header: "Inicio",
      key: "inicio",
      width: 10,
    },
    {
      header: "Fin",
      key: "fin",
      width: 10,
    },
    {
      header: "Factura Rel.",
      key: "fact_rel",
      width: 10,
    },
    {
      header: "Estado",
      key: "status",
      width: 13,
    },
    {
      header: "Adicional",
      key: "adicional",
      width: 10,
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 20 }} />;
  if (isError) return <p>{error.message}</p>;
  if (!data) return <ErrorResultServer />;

  return (
    <div className="px-1">
      <div className="flex flex-row justify-between items-center p-2">
        <h2 className="text-base lg:text-2xl text-mist-700 dark:text-mist-50 font-bold">
          Registros de servicios chips
        </h2>
        <div className="flex flex-row gap-2">
          <ButtomNew
            name="Agregar registro"
            onClick={() => setOpenCreateModal(true)}
          />
          <Button type="primary" onClick={() => ModalMasivoChips.toggle()}>
            Masivo
          </Button>
          <HistorialSerivicioChipsModal
            open={ModalMasivoChips.isToggled}
            onClose={ModalMasivoChips.toggle}
          />
          <ButtonWatch onClick={handleOpen}>Ver chips</ButtonWatch>
          <Modal
            title="Lista de chips"
            open={openChipsRegistros}
            onOk={handleClose}
            onCancel={handleClose}
            footer={null}
            destroyOnHidden
            maskClosable={false}
            width={"95%"}
            centered
            styles={{
              body: {
                height: "80vh",
                overflowY: "auto",
                overflowX: "hidden",
              },
            }}
          >
            <Showchips />
          </Modal>
        </div>
      </div>
      <TableBaseFuzzyCntasPorCobrar<DataType>
        data={dataSource}
        columns={columns}
        fuzzyFilter={fuzzyFilter}
        columFiltersInitialValue={columnFilters}
        cantidadFilas={15}
        excelFileName="Registro de servicios chips"
        columnsExcel={columnsExcel}
      />

      {/* OPTIMIZACIÓN: Renderizado condicional para liberar memoria */}
      {selectedUserId !== null && (
        <ModalUpdateChipServicio
          id={selectedUserId}
          open={selectedUserId !== null}
          onClose={handleCloseModal}
        />
      )}

      {openCreateModal && (
        <ModalCrearChipServicio
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TablaMostrarRegistrosChipServicio;
