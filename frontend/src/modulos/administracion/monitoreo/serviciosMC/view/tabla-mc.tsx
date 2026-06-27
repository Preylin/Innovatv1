import { useState, useMemo, type FC } from "react";
import { TableBaseFuzzyCntasPorCobrar } from "../../../../../components/tanstack-table/TablaBaseTsKFilterPaginacion";
import {
  sortingFns,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
} from "@tanstack/react-table";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import type { MCManagerData } from "../model/ManagerData";
import { ListRestart, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "#components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "#components/ui/field";
import { useDeleteServiciosMC, useUpdateServiciosMCEstado } from "../model/api/mc-api";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTrigger } from "#components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";
import { AlertDialogDestructive } from "#components/ui/AlertDialogDestructive";
import ActualizarRegistroMC from "./actualizar-registro-mc";

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
interface EstadoCeldaInteractivaProps {
  valorOriginal: string | null | undefined;
  rowId: number;
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
const EstadoCeldaInteractiva: FC<EstadoCeldaInteractivaProps> = ({
  valorOriginal,
  rowId,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const estadoNormalizado: string = (
    valorOriginal || "PENDIENTE"
  ).toUpperCase();

  const { mutateAsync, isPending } = useUpdateServiciosMCEstado(rowId);

  const badgeStyles: string =
    estadoNormalizado === "PENDIENTE"
      ? "bg-yellow-100 text-yellow-800"
      : estadoNormalizado === "RENOVADO"
        ? "bg-green-100 text-green-800"
        : estadoNormalizado === "NO RENOVADO"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800";

  const handleEstadoChange = async (nuevoEstado: string): Promise<void> => {
    try {
      await mutateAsync({ estado: nuevoEstado });
      toast.success("Estado actualizado correctamente", {
        position: "top-center",
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("No se pudo actualizar el estado", {
        position: "top-center",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center">
          <button
            disabled={isPending}
            className={`flex items-center cursor-pointer px-2 py-1 text-[8px] md:text-[10px] justify-center font-semibold rounded-md transition-opacity ${badgeStyles} ${isPending ? "opacity-50 pointer-events-none" : ""}`}
          >
            {isPending ? "Actualizando..." : valorOriginal || "PENDIENTE"}
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm p-8">
        <RadioGroup
          value={estadoNormalizado}
          onValueChange={handleEstadoChange}
          className="max-w-sm"
          disabled={isPending}
        >
          <FieldLabel htmlFor="pending-plan">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Pendiente</FieldTitle>
                <FieldDescription>
                  Servicio en proceso de verificación y renovación.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="PENDIENTE" id="pending-plan" />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor="renewed-plan">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Renovado</FieldTitle>
                <FieldDescription>
                  Servicio renovado. Importante: Debe realizar el nuevo registro
                  respectivo.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="RENOVADO" id="renewed-plan" />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor="no-renewed-plan">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>No renovado</FieldTitle>
                <FieldDescription>Servicio no renovado.</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="NO RENOVADO" id="no-renewed-plan" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
};

const dateFilterFn: FilterFn<MCManagerData> = (row, columnId, filterValue) => {
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

function TablaMostrarRegistrosMC({ data }: { data: MCManagerData[] }) {

  const { mutateAsync, isPending } = useDeleteServiciosMC();

  const [columnFilters] = useState<ColumnFiltersState>([
    {
      id: "estado",
      value: "PENDIENTE",
    },
  ]);

  const columns = useMemo<ColumnDef<MCManagerData, any>[]>(
    () => [
      {
        accessorKey: "key",
        size: 25,
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
        accessorKey: "nro_documento",
        size: 40,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            RUC
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-center">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "razon_social",
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
        size: 100,
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
        accessorKey: "fecha_inicio",
        size: 50,
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
        accessorKey: "fecha_fin",
        size: 50,
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
        accessorKey: "dias_counter",
        size: 40,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Vencimiento
          </span>
        ),
        cell: (info) => (
         <div className="text-center text-[8px] md:text-[10px] bg-slate-300 rounded-md px-2 py-1 font-semibold">
            {info.getValue()}
          </div>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "informe",
        size: 40,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Informe
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-center">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "certificado",
        size: 40,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Certificado
          </span>
        ),
        cell: (info) => (
          <StyleDataCell className="text-center">
            {info.getValue()}
          </StyleDataCell>
        ),
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
      },
      {
        accessorKey: "servicio",
        size: 40,
        meta: { textAlign: "center" },
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
        accessorKey: "encargado",
        size: 40,
        meta: { textAlign: "center" },
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
        size: 40,
        meta: { textAlign: "center" },
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1">
            Tecnico
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
        accessorKey: "estado",
        meta: { filterVariant: "select", textAlign: "center", align: "center" },
        size: 40,
        filterFn: "equals",
        header: () => (
          <span className="flex text-[8px] md:text-[10px] items-center gap-1 w-full justify-center">
            Estado
          </span>
        ),
        cell: (info) => (
          <EstadoCeldaInteractiva
            valorOriginal={info.getValue()}
            rowId={info.row.original.id}
          />
        ),
      },
      {
        accessorKey: "actions",
        size: 30,
        meta: { textAlign: "center" },
        header: () => <span className="text-[8px] md:text-[10px]">Acción</span>,
        cell: (info) => (
          <div className="flex justify-center gap-2">
            <Drawer direction="right">
              <Tooltip>
                <DrawerTrigger asChild>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center p-0 hover:bg-accent">
                      <ListRestart size={15} className="cursor-pointer" />
                    </button>
                  </TooltipTrigger>
                </DrawerTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>

              <DrawerContent
              >
                <ActualizarRegistroMC
                  id={info.row.original.id}
                  cliente_id={info.row.original.cliente_id}
                  ubicacion_id={info.row.original.ubicacion_id}
                  fecha_inicio={info.row.original.fecha_inicio}
                  fecha_fin={info.row.original.fecha_fin}
                  fact_relacionada={info.row.original.fact_relacionada}
                  estado={info.row.original.estado}
                  informe={info.row.original.informe}
                  certificado={info.row.original.certificado}
                  encargado={info.row.original.encargado}
                  tecnico={info.row.original.tecnico}
                  servicio={info.row.original.servicio}
                  incidencia={info.row.original.incidencia}
                />
              </DrawerContent>
            </Drawer>

            <AlertDialogDestructive
              title="¿Eliminar Registro?"
              description="Esta acción no se puede deshacer."
              okText="Eliminar"
              cancelText="Cancelar"
              isLoading={isPending}
              onConfirm={async () => {
                await mutateAsync(Number(info.row.original.id));
              }}
            >
              <Trash2 size={15} className="cursor-pointer text-destructive" />
            </AlertDialogDestructive>
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

  return (
    <div className="">
      <TableBaseFuzzyCntasPorCobrar<MCManagerData>
        data={data}
        columns={columns}
        fuzzyFilter={fuzzyFilter}
        columFiltersInitialValue={columnFilters}
        cantidadFilas={15}
        excelFileName="Registro de servicios MC"
        columnsExcel={columnsExcel}
      />
    </div>
  );
}

export default TablaMostrarRegistrosMC;
