import { Badge, Card, Empty, Flex, Skeleton, Typography } from "antd";
import { useCatalogoStockLimiteMercaderiaList } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import { useCatalogoStockLimiteMaterialList } from "../../../../../api/queries/modulos/almacen/ingresos/material.api";
import { memo, useMemo } from "react";
import type { StockActualLimiteType } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import CarrucelImagenes from "../../../../../components/molecules/carrucel/Carucel";
import { defaultImage } from "../../../../../assets/images";
import getBase64WithPrefix from "../../../../../helpers/ImagesBase64";
import InfiniteCarousel from "../../../../../components/molecules/carrucel/CarrucelInfinito";
import { RiAlarmWarningFill } from "react-icons/ri";


const { Title, Text } = Typography;

// --- Tipos ---
interface ServicioMcData
  extends Omit<
    StockActualLimiteType,
    "imagen1" | "imagen2" | "imagen3" | "imagen4"
  > {
  id: string; // Cambiado a string para asegurar unicidad
  imagenTotal: string[];
  status: "mercaderia" | "material";
}

// --- Helpers ---
//filtrar solo datos para stock_actual sea igual a 0 y stock_actual <= plimit
const transformToServicioData = (
  items: StockActualLimiteType[] = [],
  type: "mercaderia" | "material",
  defaultImage: string,
): ServicioMcData[] => {
  return items
    .map((item, index) => ({
      ...item,
      // Unicidad real: prefijo + código o id de base de datos si existe
      id: `${type}-${item.codigo || index}`,
      codigo: item.codigo ?? "",
      name: (item.name ?? "").toUpperCase(),
      imagenTotal: [item.imagen1, item.imagen2, item.imagen3, item.imagen4]
        .filter(Boolean)
        .map((img) => (img ? getBase64WithPrefix(img) : defaultImage)),
      stock_actual: item.stock_actual ?? 0,
      plimit: item.plimit ?? 0,
      status: type,
    }))
    .filter(
      (item) => item.stock_actual === 0 || item.stock_actual <= item.plimit,
    );
};

// --- Componentes Atómicos ---
const BadgeStatus = memo(
  ({ stock_actual, plimit }: { stock_actual: number; plimit: number }) => {
    const config = useMemo(() => {
      if (stock_actual === 0)
        return {
          status: "error" as const,
          count: "Sin stock",
          color: "#f5222d",
          textColor: "#fff",
        };
      return {
        status: "warning" as const,
        count: "Stock Bajo",
        color: "#fadb14",
        textColor: "#000",
      };
    }, [stock_actual, plimit]);

    return (
      <Badge
        status={config.status}
        count={config.count}
        style={{
          backgroundColor: config.color,
          fontSize: "10px",
          width: "100%",
          color: config.textColor,
        }}
      />
    );
  },
);

const ProductCard = memo(({ item }: { item: ServicioMcData }) => (
  <Card
    hoverable
    style={{ width: 450}}
    styles={{ body: { padding: "8px"} }}
  >
    <Flex align="center" justify="start" gap={12} style={{ height: "100%" }}>
      <div style={{ width: 120, flexShrink: 0 }}>
        <CarrucelImagenes
          autoplay
          height={90}
          preview
          images={item.imagenTotal}
          fallback={""}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Title
          level={5}
          style={{ fontSize: "12px", margin: 0 }}
          ellipsis={{ rows: 2, tooltip: item.name }}
        >
          {item.name}
        </Title>
        <Text type="secondary" className="block text-xs" style={{fontSize: "0.7rem"}}>
          Código: {item.codigo}
        </Text>
        <Text strong className="block text-xs" style={{fontSize: "0.7rem"}}>
          Stock actual: {item.stock_actual}
        </Text>
        <div className="flex justify-between">
          <BadgeStatus stock_actual={item.stock_actual} plimit={item.plimit} />
          <Text
            type="secondary"
            style={{ fontSize: "10px", textTransform: "capitalize" }}
          >
            {item.status}
          </Text>
        </div>
      </div>
    </Flex>
  </Card>
));

// --- Componente Principal ---
export function CarrucelProductos() {
  const {
    data: dataMercaderia,
    isLoading: loadingMer,
    isError: errorMer,
  } = useCatalogoStockLimiteMercaderiaList();
  const {
    data: dataMateriales,
    isLoading: loadingMat,
    isError: errorMat,
  } = useCatalogoStockLimiteMaterialList();

  const dataSource = useMemo(() => {
    const mercaderia = transformToServicioData(
      dataMercaderia,
      "mercaderia",
      defaultImage,
    );
    const materiales = transformToServicioData(
      dataMateriales,
      "material",
      defaultImage,
    );
    return [...mercaderia, ...materiales];
  }, [dataMercaderia, dataMateriales]);

  if (loadingMer || loadingMat)
    return <Skeleton active paragraph={{ rows: 10 }} className="p-6" />;
  if (errorMer && errorMat)
    return <Empty description="Error al cargar datos" />;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px",maxHeight: 'calc(100vh - 120px)'  }}>
      {dataSource.length === 0 ? (
        <Empty description="No hay registros" />
      ) : (
        <InfiniteCarousel speed={100} gap={6} height="100%">
          {dataSource.map((item) => (
            <ProductCard key={item.codigo} item={item} />
          ))}
        </InfiniteCarousel>
      )}
    </div>
  );
}
export function PanelCarucelProductosTerminarStock() {
  return (
    <div className="md:col-span-2 md:col-start-5 flex flex-col gap-4 overflow-hidden min-h-[600px]">
      <div className="flex flex-row gap-4 justify-center items-center">
        <RiAlarmWarningFill  style={{color:"red", fontSize: "1.3rem"}} className="animate-pulse"/>
        <h1 style={{ fontSize: "1.2rem", fontWeight: "bold"}}>Recordatorio </h1>
      </div>
      <div className="overflow-auto scroll-auto w-full">
        <CarrucelProductos />
      </div>
    </div>
  );
}
