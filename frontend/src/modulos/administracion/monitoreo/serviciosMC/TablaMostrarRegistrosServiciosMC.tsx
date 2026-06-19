import {
  Button,
  Popconfirm,
  Skeleton,

} from "antd";
import {
  useDeleteServiciosMC,
  useServiciosMCList,
} from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api";
import isoToDDMMYYYY from "../../../../helpers/Fechas";
import type { ServiciosMCOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api.schema";
import {  useMemo, useState } from "react";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";

import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";
import ButtomNew from "../../../../components/molecules/botons/BottomNew";
import ModalCreateServiciosMc from "./ModalCreateServiciosMC";
import ModalUpdateServiciosMc from "./ModalActualizarRegistroServicioMC";
import { useToggle } from "../../../../hooks/Toggle";
import HistorialMantenimientoCalibracionModal from "./ModalImportacionMC";
import { TableBaseFuzzyCntasPorCobrar } from "#components/tanstack-table/TablaBaseTsKFilterPaginacion";
import { sortingFns, type ColumnDef, type ColumnFiltersState, type FilterFn, type SortingFn } from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";


interface DataType {

  key: number;
  id: number;
  empresa: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  servicio: string;
  informe: string;
  certificado: string;
  encargado: string;
  tecnico: string;
  status: string;
  incidencia: string;
  created_at: string;
}


function EstadoItem({ status }: { status: number }){
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

// Mapeo fuera del componente para no recrear la función
const mapServiciosMCTable = (proData: ServiciosMCOutApiType[]): DataType[] => {
  return proData.map((w, i) => ({
    key: i + 1,
    id: w.id ?? -1,
    empresa: w.empresa || "-",
    ubicacion: w.ubicacion || "-",
    inicio: isoToDDMMYYYY(w.inicio) || "-",
    fin: isoToDDMMYYYY(w.fin) || "-",
    servicio: w.servicio || "-",
    informe: w.informe || "-",
    certificado: w.certificado || "-",
    encargado: w.encargado || "-",
    tecnico: w.tecnico || "-",
    status: EstadoItem({ status: w.status ?? 0 }),
    incidencia: w.incidencia || "-",
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

function TablaMostrarRegistrosMc() {

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const ModalMC = useToggle();

  // Queries
  const { data, isLoading, isError, error } = useServiciosMCList();
  const { mutate, isPending } = useDeleteServiciosMC();

  // --- OPTIMIZACIÓN: Memoización de datos procesados ---
  const dataSource = useMemo(() => {
    if (!data) return [];
    const tableData = mapServiciosMCTable(data);
    return tableData;
  }, [data]);

  const [columnFilters] = useState<ColumnFiltersState>([
      {
        id: "status",
        value: "PENDIENTE",
      },
    ]);

  // Handlers Modales
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
        accessorKey: "empresa",
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
        accessorKey: "servicio",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Servicio
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
        accessorKey: "informe",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Informe
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
        accessorKey: "certificado",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Certificado
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
        accessorKey: "encargado",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Encargado
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
        accessorKey: "tecnico",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Técnico
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
        accessorKey: "incidencia",
        size: 50,
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Incidencia
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
      key: "empresa",
      width: 20,
    },
    {
      header: "Ubicación",
      key: "ubicacion",
      width: 25,
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
      header: "Servicio",
      key: "servicio",
      width: 10,
    },
    {
      header: "Informe",
      key: "informe",
      width: 10,
    },
      {
      header: "Certificado",
      key: "certificado",
      width: 10,
      },
      {
      header: "Encargado",
      key: "encargado",
      width: 10,
      },
      {
      header: "Técnico",
      key: "tecnico",
      width: 10,
    },
    {
      header: "Estado",
      key: "status",
      width: 13,
    },
    {
      header: "Incidencia",
      key: "incidencia",
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
          Registros de Innovat-Weather
        </h2>
        <div className="flex flex-row gap-3">
              <ButtomNew
                name="Agregar registro"
                onClick={() => setOpenCreateModal(true)}
              />
              <Button type="primary" onClick={ModalMC.toggle}>
                Masivo
              </Button>
              <HistorialMantenimientoCalibracionModal
                open={ModalMC.isToggled}
                onClose={ModalMC.toggle}
              />
            </div>
      </div>
      <TableBaseFuzzyCntasPorCobrar<DataType>
        data={dataSource}
        columns={columns}
        fuzzyFilter={fuzzyFilter}
        columFiltersInitialValue={columnFilters}
        cantidadFilas={15}
        excelFileName="Registro de servicios MC"
        columnsExcel={columnsExcel}
      />

      {/* OPTIMIZACIÓN: Renderizado condicional para liberar memoria */}
      {selectedUserId !== null && (
        <ModalUpdateServiciosMc
          id={selectedUserId}
          open={selectedUserId !== null}
          onClose={handleCloseModal}
        />
      )}

      {openCreateModal && (
        <ModalCreateServiciosMc
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TablaMostrarRegistrosMc;
