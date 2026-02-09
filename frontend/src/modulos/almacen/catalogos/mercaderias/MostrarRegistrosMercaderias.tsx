import {
  Card,
  Typography,
  Empty,
  Badge,
  Grid,
  Skeleton,
  Dropdown,
  Popconfirm,
  App,
  Alert,
  Row,
  Col,
} from "antd";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

// --- Imports de componentes y helpers (se mantienen igual)
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
import { useToggle, useUpdateModal } from "../../../../hooks/Toggle";
import {
  useCatalogoMercaderiaList,
  useDeleteCatalogoMercaderia,
} from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api";
import type { CatalogoMercaderiaOutType } from "../../../../api/queries/modulos/almacen/catalogos/mercaderias/mercaderia.api.schema";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Interfaces y Constantes
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

  const parentRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useState({ field: "name", value: "" });

  const handleSearch = useCallback((params: { field: string; value: string }) => {
    setSearchParams(params);
  }, []);

  // --- Lógica de Menú
  const getMenuItems = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      icon: <ButtonUpdate style={{ margin: "0px" }} />,
      onClick: () => id !== undefined && editModal.handlerOpen(id),
    },
    {
      key: "delete",
      label: (
        <Popconfirm
          title="¿Eliminar registro?"
          onConfirm={() => mutate(id, {
              onSuccess: () => message.success("Registro eliminado"),
              onError: (err) => message.error(err.message),
          })}
          okText="Eliminar"
          cancelText="Cancelar"
          okButtonProps={{ loading: isPending, danger: true }}
        >
          <ButtonDelete style={{ margin: "0px" }} />
        </Popconfirm>
      ),
    },
  ];

  // --- Procesamiento de Datos
  const dataSource = useMemo(() => {
    if (!data) return [];
    const mapped = data.map((item: CatalogoMercaderiaOutType): ServicioMcData => ({
        id: item.id!,
        codigo: item.codigo ?? "-",
        name: item.name ?? "-",
        marca: item.marca ?? "-",
        modelo: item.modelo ?? "-",
        medida: item.medida ?? "-",
        categoria: item.categoria ?? "-",
        dimension: item.dimension ?? "",
        descripcion: item.descripcion ?? "",
        imagenTotal: [item.imagen1, item.imagen2, item.imagen3, item.imagen4].filter(Boolean) as string[],
        created_at: item.created_at ?? "-",
    }));

    const sorted = ordenarPorFecha(mapped, "created_at", "desc");
    if (!searchParams.value) return sorted;
    
    const term = searchParams.value.toLowerCase();
    return sorted.filter((item) =>
      String(item[searchParams.field as keyof ServicioMcData] ?? "").toLowerCase().includes(term)
    );
  }, [data, searchParams]);

  // --- Virtualización Dinámica
  const itemsPerRow = screens.md ? 2 : 1;

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < dataSource.length; i += itemsPerRow) {
      result.push(dataSource.slice(i, i + itemsPerRow));
    }
    return result;
  }, [dataSource, itemsPerRow]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => (screens.md ? 180 : 380), [screens.md]),
    overscan: 5,
  });

  // CRÍTICO: Limpiar mediciones si cambia el número de columnas (responsive)
  useEffect(() => {
    rowVirtualizer.measure();
  }, [itemsPerRow, rowVirtualizer]);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError) return <Alert type="error" title="Error al cargar datos" showIcon />;

  return (
    <div
      ref={parentRef}
      style={{
        height: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "0 16px",
      }}
    >
      {/* Header Sticky */}
      <div className="sticky top-0 z-20 backdrop-blur-md pt-2 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
          <div className="flex-1 min-w-[300px]">
            <SearchBar options={SEARCH_OPTIONS} onSearch={handleSearch} defaultField="name" />
          </div>
          <ButtomNew name="Nuevo registro" onClick={() => createModal.toggle()} />
        </div>
      </div>

      {dataSource.length === 0 ? (
        <Empty description="No hay registros" />
      ) : (
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                gap: "12px",
                paddingBottom: "12px",
              }}
            >
              {rows[virtualRow.index].map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  style={{ flex: 1, minWidth: 0 }}
                  styles={{ body: { padding: "10px" } }}
                >
                  {/* Dropdown Acciones */}
                  <div className="absolute top-2 right-2 z-10">
                    <Dropdown menu={{ items: getMenuItems(item.id) }} trigger={["click"]} styles={{ item: { padding: "3px 0px" } }}>
                      <MoreOutlined className="text-xl cursor-pointer text-gray-400 hover:text-gray-600" />
                    </Dropdown>
                  </div>

                  <Row gutter={16} align="top">
                    <Col xs={24} md={8}>
                      <CarrucelImagenes
                        autoplay={item.imagenTotal.length > 1}
                        height={140}
                        fallback={defaultImage}
                        preview={true}
                        images={item.imagenTotal.map((img) => getBase64WithPrefix(img))}
                      />
                    </Col>
                    <Col xs={24} md={16}>
                      <Title level={5} style={{ margin: 0, fontSize: "14px", width: "85%" }} ellipsis>
                        {item.name}
                      </Title>
                      
                      <Badge count={item.categoria} style={{ backgroundColor: "#853C66", fontSize: "10px" }} />
                      
                      <div className="mt-1 flex gap-2 flex-wrap">
                        <Text type="secondary" className="text-xs">[{item.codigo}]</Text>
                        <Text type="secondary" className="text-xs">• {item.medida}</Text>
                      </div>

                      <div className="truncate mt-1">
                        <Text strong className="text-sm">{item.marca}</Text>
                        <Text type="secondary" className="text-sm"> / {item.modelo}</Text>
                      </div>

                      {item.dimension && (
                        <Text className="block text-xs mt-1">
                          <Text strong>Dim:</Text> {item.dimension}
                        </Text>
                      )}

                      {item.descripcion && (
                        <Text italic  type="secondary" ellipsis={{ tooltip: true}}>
                          <Text strong>Descripción:</Text> {item.descripcion}
                        </Text>
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
              {/* Relleno para mantener anchos consistentes */}
              {rows[virtualRow.index].length < itemsPerRow && <div style={{ flex: 1 }} />}
            </div>
          ))}
        </div>
      )}

      {/* Renderizado de Modales */}
      {createModal.isToggled && (
        <CatalogoMercaderiaCreate open={createModal.isToggled} onClose={createModal.setOff} />
      )}
      {editModal.data !== null && (
        <CatalogoMercaderiaUpdate id={editModal.data} open={editModal.isToggled} onClose={editModal.handlerClose} />
      )}
    </div>
  );
}

export default MostrarRegistrosMercaderias;