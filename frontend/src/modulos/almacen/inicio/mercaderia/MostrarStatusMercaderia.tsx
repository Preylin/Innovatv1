import { useMemo, memo } from "react";
import { useCatalogoStockLimiteMercaderiaList } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import type { StockActualLimiteType } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import { Alert, Badge, Card, Empty, Flex, Skeleton, Typography } from "antd";
import InfiniteCarousel from "../../../../components/molecules/carrucel/CarrucelInfinito";
import CarrucelImagenes from "../../../../components/molecules/carrucel/Carucel";
import { defaultImage } from "../../../../assets/images";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";

const { Title, Text } = Typography;

// --- Interfaces ---
interface ServicioMcData {
  codigo: string;
  name: string;
  imagenTotal: string[];
  stock_actual: number;
  plimit: number;
}

// --- Componentes Atómicos para Rendimiento ---
const BadgeStatus = memo(({ stock_actual, plimit }: { stock_actual: number; plimit: number }) => {
  let config = { status: "success" as any, count: "Stock normal", color: "#52c41a" };

  if (stock_actual === 0) {
    config = { status: "error", count: "Sin stock", color: "#f5222d" };
  } else if (stock_actual <= plimit) {
    config = { status: "warning", count: "Stock Bajo", color: "#fadb14" };
  }

  return (
    <Badge
      status={config.status}
      count={config.count}
      style={{ 
        backgroundColor: config.color, 
        fontSize: "10px", 
        width: "100%", 
        color: stock_actual <= plimit && stock_actual > 0 ? "#000" : "#fff" 
      }}
    />
  );
});

const ProductCard = memo(({ item }: { item: ServicioMcData }) => (
  <Card
    style={{ width: 400 }}
    styles={{ body: { padding: "12px", height: "135px" } }}
  >
    <Flex orientation="horizontal" align="center" justify="start" gap={8} style={{ height: "100%" }}>
        <Flex align="center" justify="center">
          <div style={{ width: 120, flexShrink: 0 }}>
            <CarrucelImagenes
              autoplay
              height={90}
              fallback={defaultImage}
              preview
              images={item.imagenTotal.map(img => img ? getBase64WithPrefix(img) : defaultImage)}
            />
          </div>
        </Flex>
        <div>
        <Title
          level={5}
          style={{fontSize: "14px" }}
          ellipsis={{ rows: 2, tooltip: item.name }}
        >
          {item.name}
        </Title>
        <Text type="secondary" style={{display: "block"}}>Código: {item.codigo}</Text>
        <Text strong style={{display: "block"}}>Stock actual: {item.stock_actual}</Text>
        <BadgeStatus stock_actual={item.stock_actual} plimit={item.plimit} />
        </div>
    </Flex>
  </Card>
));

// --- Componente Principal ---
function MercaderiaStatus() {
  const { data, isLoading, isError} = useCatalogoStockLimiteMercaderiaList();

  const categorizedData = useMemo(() => {
    const result = {
      agotado: [] as ServicioMcData[],
      porAgotarse: [] as ServicioMcData[],
      normal: [] as ServicioMcData[],
    };

    if (!data) return result;

    data.forEach((item: StockActualLimiteType) => {
      const formattedItem: ServicioMcData = {
        codigo: item.codigo ?? "",
        name: (item.name ?? "").toUpperCase(),
        imagenTotal: [item.imagen1, item.imagen2, item.imagen3, item.imagen4].filter(Boolean) as string[],
        stock_actual: item.stock_actual ?? 0,
        plimit: item.plimit ?? 0,
      };

      if (formattedItem.stock_actual === 0) {
        result.agotado.push(formattedItem);
      } else if (formattedItem.stock_actual <= formattedItem.plimit) {
        result.porAgotarse.push(formattedItem);
      } else {
        result.normal.push(formattedItem);
      }
    });

    return result;
  }, [data]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;
  if (!data || data.length === 0)
    return <Empty description="No se encontraron datos" />;

  const sections = [
    { title: "Agotado", data: categorizedData.agotado, color: "#f5222d" },
    { title: "Por Agotarse", data: categorizedData.porAgotarse, color: "#faad14" },
    { title: "Normal", data: categorizedData.normal, color: "#52c41a" },
  ];

  return (
    <div className="p-2">
      {sections.map((section) => (
        section.data.length > 0 && (
          <div key={section.title} style={{ marginBottom: "1rem" }}>
            <Title level={4} style={{ color: section.color }}>
              {section.title} ({section.data.length})
            </Title>
            <InfiniteCarousel speed={25}>
              {section.data.map((item) => (
                <ProductCard key={item.codigo} item={item} />
              ))}
            </InfiniteCarousel>
          </div>
        )
      ))}
    </div>
  );
}

export default MercaderiaStatus;