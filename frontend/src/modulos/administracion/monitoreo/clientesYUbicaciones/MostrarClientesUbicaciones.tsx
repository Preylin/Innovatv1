import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Empty,
  Flex,
  Grid,
  Skeleton,
  Space,
  Tag,
  Typography,
  type MenuProps,
} from "antd";
import { useClientesList } from "../../../../api/queries/modulos/administracion/monitoreo/clientes.lista";
import { SearchBar } from "../../../../components/molecules/input/SearchBar";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ClienteShowAndUpdate from "./ActualizarClientesUbicaciones";
import CrearClienteModal from "./ModalClientesCreate";
import CrearUbicacionesModal from "./ModalUbicacionesCreate";
import { MoreOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useBreakpoint } = Grid;

// --- Interfaces de Tipado ---
interface Ubicacion {
  id: number;
  name: string;
}

interface Cliente {
  id: number;
  name: string;
  ruc: string;
  ubicaciones: Ubicacion[];
}

// Tipado para los campos de búsqueda permitidos
type ClienteSearchFields = keyof Pick<Cliente, "name" | "ruc" | "ubicaciones">;

interface SearchParams {
  field: ClienteSearchFields;
  value: string;
}

// --- Constantes ---
const SEARCH_OPTIONS: { label: string; value: ClienteSearchFields }[] = [
  { label: "Nombre", value: "name" },
  { label: "RUC", value: "ruc" },
  { label: "Dirección", value: "ubicaciones" },
];

function ShowClientes() {
  const [openCliente, setOpenCliente] = useState(false);
  const [openUbicaciones, setOpenUbicaciones] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const screens = useBreakpoint();

  const { data, isLoading, isError } = useClientesList();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    field: "name",
    value: "",
  });

  const handleSearch = useCallback(
    (params: { field: string; value: string }) => {
      // Cast seguro ya que SearchBar devuelve valores controlados por SEARCH_OPTIONS
      setSearchParams(params as SearchParams);
    },
    [],
  );

  const handleOpenUpdate = (id: number) => setSelectedUserId(id);
  const handleCloseModal = () => setSelectedUserId(null);
  // --- Función para generar el menú por cada item
  const getMenuItems = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      icon: <ButtonUpdate style={{margin: '0px'}} />,
      onClick: () => handleOpenUpdate(id),
    },
  ];

  const cardFlexStyle = useMemo(() => {
    if (screens.xl) return { flex: "0 0 calc(25% - 12px)", minWidth: "300px" };
    if (screens.lg)
      return { flex: "0 0 calc(33.33% - 12px)", minWidth: "300px" };
    if (screens.md) return { flex: "0 0 calc(50% - 12px)", minWidth: "300px" };
    return { flex: "1 1 100%", minWidth: "100%" };
  }, [screens]);

  // --- Lógica de Filtrado con Tipado Estricto ---
  const filteredData = useMemo<Cliente[]>(() => {
    if (!data) return [];
    const { field, value } = searchParams;
    if (!value) return data;

    const term = value.toLowerCase();

    return data.filter((item: Cliente) => {
      // Caso especial: Búsqueda en el array de ubicaciones
      if (field === "ubicaciones") {
        return item.ubicaciones.some((u) =>
          u.name.toLowerCase().includes(term),
        );
      }

      // Caso estándar: Acceso dinámico a propiedades de tipo string
      const valToSearch = item[field];
      return String(valToSearch ?? "")
        .toLowerCase()
        .includes(term);
    });
  }, [data, searchParams]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isError)
    return <Alert type="error" title="Error al cargar clientes" showIcon />;
  if (!data || data.length === 0)
    return <Empty description="No se encontraron clientes" />;

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4 pt-2 px-6 shadow-sm mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="name"
            />
          </div>
          <Space>
            <Button type="primary" onClick={() => setOpenCliente(true)}>
              Agregar Cliente
            </Button>
            <Button variant="filled" color="magenta" onClick={() => setOpenUbicaciones(true)}>
              Asignar Ubicaciones
            </Button>
          </Space>
        </div>
      </div>

      <Flex wrap="wrap" justify="start" gap={12}>
        {filteredData.length > 0 ? (
          filteredData.map((cliente) => (
            <Card
              key={cliente.id}
              className="w-80 shadow-sm"
              hoverable
              style={cardFlexStyle}
              styles={{
                body: {
                  padding: "16px",
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
                  menu={{ items: getMenuItems(cliente.id) }}
                  trigger={["click"]}
                  styles={{item: {padding: '0px'}}}
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
              <Flex vertical gap={4}>
                <Text strong className="text-lg">
                  {cliente.name}
                </Text>
                <Text type="secondary">RUC: {cliente.ruc}</Text>

                {cliente.ubicaciones.length > 0 && (
                  <fieldset className="mt-2 flex flex-col gap-2 border border-teal-600/30 p-3 rounded-md">
                    <legend className="px-2 text-xs font-medium text-teal-700">
                      Ubicaciones:
                    </legend>
                    <Flex wrap="wrap" gap={4}>
                      {cliente.ubicaciones.map((u) => (
                        <Tag
                          key={u.id}
                          color="#634D46"
                          className="m-0 max-w-full"
                          style={{
                            whiteSpace: "normal",
                            height: "auto",
                            padding: "2px 8px",
                          }}
                        >
                          {u.name}
                        </Tag>
                      ))}
                    </Flex>
                  </fieldset>
                )}
              </Flex>
            </Card>
          ))
        ) : (
          <Empty description="No coinciden resultados con la búsqueda" />
        )}
      </Flex>

      {/* Modales condicionales */}
      {openCliente && (
        <CrearClienteModal
          open={openCliente}
          onClose={() => setOpenCliente(false)}
        />
      )}
      {openUbicaciones && (
        <CrearUbicacionesModal
          open={openUbicaciones}
          onClose={() => setOpenUbicaciones(false)}
        />
      )}
      {selectedUserId !== null && (
        <ClienteShowAndUpdate
          id={selectedUserId}
          open={selectedUserId !== null}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default ShowClientes;
