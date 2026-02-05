import { useCallback, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Popconfirm,
  Skeleton,
  Empty,
  Flex,
  Grid,
  type MenuProps,
  Dropdown,
} from "antd";
import {
  useChipsList,
  useDeleteChip,
} from "../../../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import { SearchBar } from "../../../../../components/molecules/input/SearchBar";
import CarrucelImagenes from "../../../../../components/molecules/carrucel/Carucel";
import isoToDDMMYYYY from "../../../../../helpers/Fechas";
import ButtonUpdate from "../../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../../components/molecules/botons/BottonDelete";
import ModalChipsCreate from "./ModalChipsCreate";
import ModalChipsUpdate from "./ModalChipsUpdate";
import type { ChipOutType } from "../../../../../api/queries/modulos/administracion/monitoreo/clientes.api.schemas";
import { defaultImage } from "../../../../../assets/images";
import { ordenarPorFecha } from "../../../../../helpers/OrdenacionAscDscPorFechasISO";
import { MoreOutlined } from "@ant-design/icons";
import getBase64WithPrefix from "../../../../../helpers/ImagesBase64";

const { useBreakpoint } = Grid;

// --- Constantes y Helpers
const SEARCH_OPTIONS = [
  { label: "Número", value: "numero" },
  { label: "ICCID", value: "iccid" },
  { label: "Operador", value: "operador" },
  { label: "Plan MB", value: "mb" },
  { label: "Activación", value: "activacion" },
  { label: "Instalación", value: "instalacion" },
  { label: "Inf. adicional", value: "adicional" },
  { label: "Status", value: "status" },
];

function getStatusLabel(status: number): string {
  const map: Record<number, string> = {
    0: "En stock",
    1: "Activo",
    2: "De baja",
  };
  return map[status] ?? "Sin información";
}

// Componente pequeño memoizado para el estado
const OptionStatusUI = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    "En stock": "text-yellow-500",
    Activo: "text-green-600",
    "De baja": "text-red-600",
  };
  return <div className={styles[status] || ""}>Estado: {status}</div>;
};

interface ChipData {
  id: number;
  numero: string;
  iccid: string;
  operador: string;
  mb: string;
  activacion: string;
  instalacion: string;
  adicional: string;
  status: string;
  imagenTotal: string[];
  created_at: string;
}

function Showchips() {
  const { message } = App.useApp();
  const { mutate, isPending } = useDeleteChip();
  const screens = useBreakpoint();

  // Estados de control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchParams, setSearchParams] = useState({
    field: "numero",
    value: "",
  });

  const { data, isLoading, isError } = useChipsList();

  // Handlers
  const handleOpenUpdate = (id: number) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleCloseUpdate = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleSearch = useCallback(
    (params: { field: string; value: string }) => {
      setSearchParams(params);
    },
    [],
  );

  // --- Función para generar el menú por cada item
  const getMenuItems = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      icon: <ButtonUpdate style={{margin: '0px'}}/>,
      onClick: () => handleOpenUpdate(id),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="¿Eliminar registro?"
          description="Esta acción no se puede deshacer"
          onConfirm={() =>
            mutate(id, {
              onSuccess: () => message.success("Registro eliminado"),
              onError: (err) => message.error(err.message),
            })
          }
          okText="Eliminar"
          cancelText="Cancelar"
          okButtonProps={{ loading: isPending, danger: true }}
        >
          <ButtonDelete style={{margin: '0px'}}/>
        </Popconfirm>
      ),
    },
  ];

  // --- OPTIMIZACIÓN: Procesamiento de datos centralizado y memoizado ---
  const filteredData = useMemo(() => {
    if (!data) return [];

    // 1. Transformar y mapear
    const mapped = data.map(
      (chip: ChipOutType): ChipData => ({
        id: chip.id ?? -1,
        numero: chip.numero?.toString() ?? "-",
        iccid: chip.iccid ?? "-",
        operador: chip.operador ?? "-",
        mb: chip.mb ?? "-",
        activacion: isoToDDMMYYYY(chip.activacion) ?? "-",
        instalacion: isoToDDMMYYYY(chip.instalacion) ?? "-",
        adicional: chip.adicional ?? "-",
        status: getStatusLabel(chip.status),
        imagenTotal: [chip.imagen1 ?? "", chip.imagen2 ?? ""].filter(Boolean) as string[],
        created_at: chip.created_at ?? "-",
      }),
    );

    // 2. Ordenar
    const sorted = ordenarPorFecha(mapped, "created_at", "desc");

    // 3. Filtrar
    if (!searchParams.value) return sorted;
    const term = searchParams.value.toLowerCase();
    return sorted.filter((item) =>
      String(item[searchParams.field as keyof ChipData] ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [data, searchParams]);

  const cardFlexStyle = useMemo(() => {
    if (screens.xl) return { flex: "0 0 calc(25% - 12px)", minWidth: "300px" };
    if (screens.lg)
      return { flex: "0 0 calc(33.33% - 12px)", minWidth: "300px" };
    if (screens.md) return { flex: "0 0 calc(50% - 12px)", minWidth: "300px" };
    return { flex: "1 1 100%", minWidth: "100%" };
  }, [screens]);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return (
      <div className="p-6 text-red-500 text-center">Error al cargar datos</div>
    );
  if (!data || data.length === 0)
    return <Empty description="No hay chips registrados" className="mt-10" />;

  return (
    <div className="flex flex-col gap-4 px-2">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4 pt-2 px-6 shadow-sm mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="numero"
            />
          </div>
          <Button type="primary" onClick={() => setOpenCreate(true)}>
            Crear Chip
          </Button>
        </div>
      </div>

      {/* Grid de Cards */}
      <Flex wrap="wrap" gap={12} justify="start">
        {filteredData.map((chip) => (
          <Card
            key={chip.id}
            style={cardFlexStyle}
            hoverable
            className="shadow-sm border-gray-100"
            styles={{
              body: {
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              },
            }}
          >
            <div
              style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
            >
              <Dropdown
                menu={{ items: getMenuItems(chip.id) }}
                trigger={["click"]}
                styles={{ item: { padding: "3px 0px" } }}
              >
                <MoreOutlined
                  style={{
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#8c8c8c",
                  }}
                />
              </Dropdown>
            </div>
            <div className="mb-3">
              <CarrucelImagenes
                autoplay={false}
                height={160}
                fallback={defaultImage}
                preview={true}
                images={chip.imagenTotal.map((img) => getBase64WithPrefix(img))}
              />
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Número:</strong> {chip.numero}
              </p>
              <p>
                <strong>ICCID:</strong> {chip.iccid}
              </p>
              <p>
                <strong>Operador:</strong> {chip.operador}
              </p>
              <p>
                <strong>Plan MB:</strong> {chip.mb}
              </p>
              <p>
                <strong>Activación:</strong> {chip.activacion}
              </p>
              <p>
                <strong>Instalación:</strong> {chip.instalacion}
              </p>
              <p className="truncate">
                <strong>Adicional:</strong> {chip.adicional}
              </p>
              <OptionStatusUI status={chip.status} />
            </div>
          </Card>
        ))}
      </Flex>

      {/* Modales con Renderizado Condicional para limpieza de memoria */}
      {openCreate && (
        <ModalChipsCreate
          open={openCreate}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {selectedUserId !== null && (
        <ModalChipsUpdate
          id={selectedUserId}
          open={isModalOpen}
          onClose={handleCloseUpdate}
        />
      )}
    </div>
  );
}

export default Showchips;
