import {
  Card,
  Flex,
  Typography,
  Empty,
  Space,
  Badge,
  Grid,
  Skeleton,
  Alert,
} from "antd";

import { useCallback, useMemo, useState } from "react";
import CarrucelImagenes from "../../../../components/molecules/carrucel/Carucel";
import { defaultImage } from "../../../../assets/images";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";
import { SearchBar } from "../../../../components/molecules/input/SearchBar";

import { useCatalogoStockDetalladoMercaderiaList } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import type { StockActualDetalladoType } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";
import isoToDDMMYYYY from "../../../../helpers/Fechas";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface ServicioMcData {
  id: number;
  codigo: string;
  name: string;
  marca: string;
  modelo: string;
  medida: string;
  dimension: string;
  categoria: string;
  plimit: number;
  serie: string;
  stock_actual: number;
  valor: number;
  total: number;
  moneda: string;
  fecha_ingreso: string;
  image_byte: string;
  ubicacion: string;
}

// --- Constantes y Helpers
const SEARCH_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Marca", value: "marca" },
  { label: "Modelo", value: "modelo" },
  { label: "Medida", value: "medida" },
  { label: "Dimensión", value: "dimension" },
  { label: "Categoría", value: "categoria" },
  { label: "Serie", value: "serie" },
  { label: "Código", value: "codigo" },
  { label: "Stock actual", value: "stock_actual" },
  { label: "Valor unitario", value: "valor" },
  { label: "Ubicación", value: "ubicacion" },
  
];

function MostrarStockMercaderias() {
  const { data, isLoading, isError } =
    useCatalogoStockDetalladoMercaderiaList();
  const screens = useBreakpoint();

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

  const dataSource = useMemo(() => {
    if (!data) return [];
    const mapped = data.map(
      (item: StockActualDetalladoType, index: number): ServicioMcData => ({
        id: index,
        codigo: item.codigo ?? "",
        name: item.name.toUpperCase() ?? "",
        marca: item.marca.toUpperCase() ?? "",
        modelo: item.modelo.toUpperCase() ?? "",
        medida: item.medida.toUpperCase() ?? "",
        dimension: item.dimension.toUpperCase() ?? "",
        categoria: item.categoria.toUpperCase() ?? "",
        plimit: item.plimit ?? 0,
        serie: item.serie ?? "",
        stock_actual: item.stock_actual ?? 0,
        valor: item.valor ?? 0,
        total: ((item.stock_actual ?? 0) * (item.valor ?? 0)),
        moneda: item.moneda ?? "",
        fecha_ingreso: item.fecha_ingreso ?? "",
        image_byte: getBase64WithPrefix(item.image_byte) ?? "",
        ubicacion: item.ubicacion.toUpperCase() ?? "",
      }),
    );

    // 2. Ordenar
    const sorted = ordenarPorFecha(mapped, "fecha_ingreso", "desc");

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
      minWidth: screens.md ? "650px" : "100%",
    }),
    [screens], 
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
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
        </div>
      </div>

      <Flex justify="start" wrap="wrap" gap={12} style={{ padding: "16px" }}>
        {dataSource.length === 0 ? (
          <Empty description="No hay registros" />
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
              <Flex gap="large" align="start" style={{ width: "100%" }}>
                {/* Sección Visual: Carrusel */}
                <div style={{ width: 200, flexShrink: 0 }}>
                  <CarrucelImagenes
                    autoplay={true}
                    height={160}
                    fallback={defaultImage}
                    preview={true}
                    images={item.image_byte ? [item.image_byte] : []}
                  />
                </div>

                {/* Sección Información */}
                <Flex vertical style={{ flex: 1 }} gap={2}>
                  <Title
                    style={{ margin: 0, fontSize: "14px", width: "90%" }}
                  >
                    {item.name}
                  </Title>
                  <Space size={8} style={{ fontSize: "12px" }}>
                    <Space size={4}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      [{item.codigo}]
                    </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      • {item.medida}
                    </Text>
                  </Space>
                  <Badge
                    count={item.categoria}
                    style={{ backgroundColor: "#f5222d", fontSize: "8px" }}
                  />
                  </Space>
                  <div>
                    <Text strong style={{ fontSize: "12px" }}>{item.marca}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}> / {item.modelo}</Text>
                  </div>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>Dimensión: </Text> {item.dimension}
                  </Text>
                  
                  <Flex gap={8}>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>En stock: </Text> {item.stock_actual}
                  </Text>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>- V.U: </Text> {item.moneda}{" "}
                    {item.valor.toFixed(2)}
                  </Text>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>- Total: </Text> {item.moneda}{" "} {item.total.toFixed(2)}
                  </Text>
                  </Flex>
                  <Flex gap={8}>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>Stock mínimo: </Text> {item.plimit}
                  </Text>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>Fecha de ingreso: </Text> {isoToDDMMYYYY(item.fecha_ingreso)}
                  </Text>
                  </Flex>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>Serie o codigo único: </Text> {item.serie }
                  </Text>
                  <Text style={{ fontSize: "12px" }}>
                    <Text strong>Ubicación: </Text> {item.ubicacion }
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))
        )}
      </Flex>
    </>
  );
}

export default MostrarStockMercaderias;
