import {
  Alert,
  Badge,
  Card,
  Empty,
  Flex,
  Skeleton,
  Tabs,
  Tooltip,
  Typography,
  type TabsProps,
} from "antd";
import { UseBarAlmacenIcons } from "../../../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import { useCatalogoStockLimiteMercaderiaList } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import { memo, useMemo, useState } from "react";
import type { StockActualLimiteType } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import { SearchBar } from "../../../../../components/molecules/input/SearchBar";
import CarrucelImagenes from "../../../../../components/molecules/carrucel/Carucel";
import { defaultImage } from "../../../../../assets/images";
import getBase64WithPrefix from "../../../../../helpers/ImagesBase64";
import { useCatalogoStockLimiteMaterialList } from "../../../../../api/queries/modulos/almacen/ingresos/material.api";

const { Title, Text } = Typography;

interface ServicioMcData {
  id: number;
  codigo: string;
  name: string;
  imagenTotal: string[];
  stock_actual: number;
  plimit: number;
  status: string;
}

const SEARCH_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Código", value: "codigo" },
  { label: "Stock", value: "stock_actual" },
  { label: "Status", value: "status" },
];


function Status({stock_actual, plimit}: {stock_actual: number, plimit: number}){

  switch (true) {
    case stock_actual === 0:
      return "Sin stock"
    case stock_actual <= plimit:
      return "Stock bajo"
    default:
      return "Stock normal"
  }

}

// --- Componentes Atómicos para Rendimiento ---
const BadgeStatus = memo(({ status, plimit }: { status: string, plimit: number}) => {
  let config = { status: "success" as any, count: "Stock normal", color: "#52c41a" };

  if (status === "Sin stock") {
    config = { status: "error", count: "Sin stock", color: "#f5222d" };
  } else if (status === "Stock bajo") {
    config = { status: "warning", count: "Stock Bajo", color: "#fadb14" };
  }

  return (
    <Tooltip title={<div>Límite mínimo: {plimit}</div>}>
    <Badge
      status={config.status}
      count={config.count}
      style={{
        backgroundColor: config.color,
        fontSize: "10px",
        width: "100%",
      }}
    />
    </Tooltip>
  );
});

function MercaderiaSearch() {
  const { data, isLoading, isError } = useCatalogoStockLimiteMercaderiaList();
  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });
  const handleSearch = (params: { field: string; value: string }) => {
    setSearchParams(params);
  };

  const dataSource = useMemo(() => {
    if (!data) return [];
    const mapped = data.map(
      (item: StockActualLimiteType, index: number): ServicioMcData => ({
        id: index,
        codigo: item.codigo ?? "",
        name: (item.name ?? "").toUpperCase(),
        imagenTotal: [
          item.imagen1,
          item.imagen2,
          item.imagen3,
          item.imagen4,
        ].filter(Boolean) as string[],
        stock_actual: item.stock_actual ?? 0,
        plimit: item.plimit ?? 0,
        status: Status({stock_actual: item.stock_actual, plimit: item.plimit})
      }),
    );

    if (!searchParams.value) return mapped;
    const term = searchParams.value.toLowerCase();
    return mapped.filter((item) =>
      String(item[searchParams.field as keyof ServicioMcData] ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [data, searchParams]);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;

  return (
    <div>
      <div className="sticky top-0 z-20 backdrop-blur-md pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="name"
            />
          </div>
        </div>
      </div>

      <div 
        className="flex-1 flex flex-col gap-2 overflow-y-auto px-2 pb-4 custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {dataSource.length === 0 ? (
          <Empty description="No hay registros" />
        ) : (
          dataSource.map((item) => (
            <Card
              style={{ width: "100%"}}
              styles={{ body: { padding: "8px"} }}
              hoverable
              key={item.id}
            >
              <Flex
                align="center"
                justify="start"
                gap={8}
                style={{ height: "100%" }}
              >
                <div style={{ width: 60, flexShrink: 0 }}>
                  <CarrucelImagenes
                    autoplay
                    height={40}
                    fallback={defaultImage}
                    preview
                    images={item.imagenTotal.map((img) =>
                      img ? getBase64WithPrefix(img) : defaultImage,
                    )}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                  <Title
                    style={{ fontSize: "12px",}}
                    ellipsis={{ rows: 1, tooltip: item.name }}
                  >
                    {item.name}
                  </Title>
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="flex gap-2">
                  <Text className="block px-1 rounded-md" style={{fontSize:"0.7rem", background: "#E2928D", color: "#000", fontWeight: "bold"}}>
                    Código: {item.codigo}
                  </Text>
                  <Text  className="block px-1 rounded-md" style={{fontSize:"0.7rem", background: "#F4CAAB", color: "#000", fontWeight: "bold"}}>
                    En stock: {item.stock_actual}
                  </Text>
                  </div>
                  <BadgeStatus status={item.status} plimit={item.plimit} />
                  </div>
                </div>
              </Flex>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


function MaterialSearch() {
  const { data, isLoading, isError } = useCatalogoStockLimiteMaterialList();
  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });
  const handleSearch = (params: { field: string; value: string }) => {
    setSearchParams(params);
  };

  const dataSource = useMemo(() => {
    if (!data) return [];
    const mapped = data.map(
      (item: StockActualLimiteType, index: number): ServicioMcData => ({
        id: index,
        codigo: item.codigo ?? "",
        name: (item.name ?? "").toUpperCase(),
        imagenTotal: [
          item.imagen1,
          item.imagen2,
          item.imagen3,
          item.imagen4,
        ].filter(Boolean) as string[],
        stock_actual: item.stock_actual ?? 0,
        plimit: item.plimit ?? 0,
        status: Status({stock_actual: item.stock_actual, plimit: item.plimit})
      }),
    );

    if (!searchParams.value) return mapped;
    const term = searchParams.value.toLowerCase();
    return mapped.filter((item) =>
      String(item[searchParams.field as keyof ServicioMcData] ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [data, searchParams]);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;

  return (
    <div>
      <div className="sticky top-0 z-20 backdrop-blur-md pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="name"
            />
          </div>
        </div>
      </div>
      <div 
        className="flex-1 flex flex-col gap-2 overflow-y-auto px-2 pb-4 custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {dataSource.length === 0 ? (
          <Empty description="No hay registros" />
        ) : (
          dataSource.map((item) => (
            <Card
              style={{ width: "100%"}}
              styles={{ body: { padding: "8px"} }}
              hoverable
              key={item.id}
            >
              <Flex
                align="center"
                justify="start"
                gap={8}
                style={{ height: "100%" }}
              >
                <div style={{ width: 60, flexShrink: 0 }}>
                  <CarrucelImagenes
                    autoplay
                    height={40}
                    fallback={defaultImage}
                    preview
                    images={item.imagenTotal.map((img) =>
                      img ? getBase64WithPrefix(img) : defaultImage,
                    )}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                  <Title
                    style={{ fontSize: "12px",}}
                    ellipsis={{ rows: 1, tooltip: item.name }}
                  >
                    {item.name}
                  </Title>
                  <div className="flex flex-row gap-2 justify-between">
                    <div className="flex gap-2">
                  <Text className="block px-1 rounded-md" style={{fontSize:"0.7rem", background: "#E2928D", color: "#000", fontWeight: "bold"}}>
                    Código: {item.codigo}
                  </Text>
                  <Text  className="block px-1 rounded-md" style={{fontSize:"0.7rem", background: "#F4CAAB", color: "#000", fontWeight: "bold"}}>
                    En stock: {item.stock_actual}
                  </Text>
                  </div>
                  <BadgeStatus status={item.status} plimit={item.plimit} />
                  </div>
                </div>
              </Flex>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function PanelBusquedaProductos() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <MercaderiaSearch />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <MaterialSearch />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
    <div className="md:col-span-3 md:col-start-2 overflow-hidden min-h-[600px]">
      <Tabs defaultActiveKey="1" items={items}></Tabs>
    </div>
  );
}
