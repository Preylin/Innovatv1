import {
  Card,
  Flex,
  Typography,
  Empty,
  Space,
  Badge,
  Grid,
  Skeleton,
  Dropdown,
  Popconfirm,
  App,
  Alert,
} from "antd";

import { useCallback, useMemo, useState } from "react";
import CarrucelImagenes from "../../../../components/molecules/carrucel/Carucel";
import { defaultImage } from "../../../../assets/images";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";
import { SearchBar } from "../../../../components/molecules/input/SearchBar";
import CatalogoMercaderiaCreate from "./CrearCatalogoMercaderia";
import ButtomNew from "../../../../components/molecules/botons/BottomNew";
import type { MenuProps } from "antd/lib";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import { MoreOutlined } from "@ant-design/icons";
import CatalogoMercaderiaUpdate from "./ActualizarCatalogoMercaderia";
import {useToggle, useUpdateModal} from "../../../../hooks/Toggle";
import { useCatalogoMercaderiaList, useDeleteCatalogoMercaderia } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api";
import type { CatalogoMercaderiaOutType } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api.schema";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface ServicioMcData {
  id: number;
  codigo: string;
  name: string;
  marca: string;
  modelo: string;
  medida: string;
  categoria: string;
  dimension: string;
  descripcion: string;
  imagenTotal: string[];
  created_at: string;
}

// --- Constantes y Helpers
const SEARCH_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Categoría", value: "categoria" },
  { label: "Código", value: "codigo" },
  { label: "Medida", value: "medida" },
  { label: "Marca", value: "marca" },
  { label: "Modelo", value: "modelo" },
  { label: "Dimensión", value: "dimension" },
  { label: "Descripción", value: "descripcion" },
];

function MostrarRegistrosMercaderias() {
  const { message } = App.useApp();
  const { data, isLoading, isError } = useCatalogoMercaderiaList();
  const { mutate, isPending } = useDeleteCatalogoMercaderia();
  const screens = useBreakpoint();
  const editModal = useUpdateModal<number>();
  const createModal = useToggle();
  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });

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
      icon: <ButtonUpdate style={{ margin: "0px" }}/>,
      onClick: () => id !== undefined && editModal.handlerOpen(id),
      disabled: id === undefined,
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
          <ButtonDelete style={{margin: '0px'}} />
        </Popconfirm>
      ),
    },
  ];

  const dataSource = useMemo(() => {
    if (!data) return [];
    const mapped = data.map(
      (item: CatalogoMercaderiaOutType): ServicioMcData => ({
        id: item.id ?? undefined,
        codigo: item.codigo ?? "-",
        name: item.name ?? "-",
        marca: item.marca ?? "-",
        modelo: item.modelo ?? "-",
        medida: item.medida ?? "-",
        categoria: item.categoria ?? "-",
        dimension: item.dimension ?? "-",
        descripcion: item.descripcion ?? "-",
        imagenTotal: [
          item.imagen1 ?? "",
          item.imagen2 ?? "",
          item.imagen3 ?? "",
          item.imagen4 ?? "",
        ].filter(Boolean) as string[],
        created_at: item.created_at ?? "-",
      }),
    );

    // 2. Ordenar
    const sorted = ordenarPorFecha(mapped, "created_at", "desc");

    // 3. Filtrar
    if (!searchParams.value) return sorted;
    const term = searchParams.value.toLowerCase();
    return sorted.filter((item) =>
      String(item[searchParams.field as keyof ServicioMcData] ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [data, searchParams]);

  const cardStyle = useMemo(
    () => ({
      flex: screens.md ? "0 0 calc(50% - 12px)" : "1 1 100%",
      minWidth: screens.md ? "500px" : "100%",
    }),
    [screens],
  );

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;
  

  return (
    <>
      <div className="sticky top-0 z-10 backdrop-blur-sm pt-2 px-6 shadow-sm mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="name"
            />
          </div>
          <ButtomNew
            name="Nuevo registro"
            onClick={() => createModal.toggle()}
          />
        </div>
      </div>

      <Flex justify="start" wrap="wrap" gap={12} style={{ padding: "16px" }}>
      {dataSource.length === 0 ? (
        <Empty description="No hay registros"/>
      ) : (
        dataSource.map((item) => (
          <Card
            key={item.id}
            hoverable
            style={cardStyle}
            styles={{
              body: {
                padding: "8px",
                display: "flex",
                flexDirection: "row",
                height: "100%",
              },
            }}
          >
            <div
              style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
            >
              <Dropdown
                menu={{ items: getMenuItems(item.id) }}
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
            <Flex gap="large" align="start" style={{ width: "100%" }}>
              {/* Sección Visual: Carrusel */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <CarrucelImagenes
                  autoplay={true}
                  height={160}
                  fallback={defaultImage}
                  preview={true}
                  images={item.imagenTotal.map((img) =>
                    img ? getBase64WithPrefix(img) : defaultImage
                  )}
                />
              </div>

              {/* Sección Información */}
              <Flex vertical style={{ flex: 1 }}>
                <Title
                  level={5}
                  style={{ margin: 0, fontSize: "14px", width: "90%" }}
                >
                  {item.name}
                </Title>
                <Badge
                  count={item.categoria}
                  style={{ backgroundColor: "#f5222d", fontSize: "8px" }}
                />
                <Space size={4}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    [{item.codigo}]
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    • {item.medida}
                  </Text>
                </Space>

                <div>
                  <Text strong>{item.marca}</Text>
                  <Text type="secondary"> / {item.modelo}</Text>
                </div>

                {item.dimension && (
                  <Text style={{ display: "block", marginTop: 4 }}>
                    <Text strong>Dimensión: </Text> {item.dimension}
                  </Text>
                )}

                {item.descripcion && (
                  <Text italic type="secondary">
                    <Text strong>Descripción: </Text>
                    {item.descripcion}
                  </Text>
                )}
              </Flex>
            </Flex>
          </Card>
        ))
      )}
      </Flex>
      {/* Modales con Renderizado Condicional para limpieza de memoria */}
      {createModal.isToggled && (
        <CatalogoMercaderiaCreate
          open={createModal.isToggled}
          onClose={createModal.setOff}
        />
      )}

      {editModal.data !== null && (
        <CatalogoMercaderiaUpdate
          id={editModal.data}
          open={editModal.isToggled}
          onClose={editModal.handlerClose}
        />
      )}
    </>
  );
}

export default MostrarRegistrosMercaderias;



