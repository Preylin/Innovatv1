import {
  Card,
  Flex,
  Typography,
  Empty,
  Badge,
  Grid,
  Skeleton,
  Alert,
  Row,
  Col,
} from "antd";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

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

const SEARCH_OPTIONS = [
  { label: "Nombre", value: "name" },
  { label: "Marca", value: "marca" },
  { label: "Modelo", value: "modelo" },
  { label: "Medida", value: "medida" },
  { label: "Dimensión", value: "dimension" },
  { label: "Categoría", value: "categoria" },
  { label: "Stock", value: "stock_actual" },
  { label: "Serie", value: "serie" },
  { label: "Código", value: "codigo" },
  { label: "Ubicación", value: "ubicacion" },
];

function MostrarStockMercaderias() {
  const { data, isLoading, isError } = useCatalogoStockDetalladoMercaderiaList();
  const screens = useBreakpoint();
  const parentRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useState({
    field: "name",
    value: "",
  });

  const handleSearch = useCallback((params: { field: string; value: string }) => {
    setSearchParams(params);
  }, []);

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
        total: (item.stock_actual ?? 0) * (item.valor ?? 0),
        moneda: item.moneda ?? "",
        fecha_ingreso: item.fecha_ingreso ?? "",
        image_byte: getBase64WithPrefix(item.image_byte) ?? "",
        ubicacion: item.ubicacion.toUpperCase() ?? "",
      })
    );

    const sorted = ordenarPorFecha(mapped, "fecha_ingreso", "desc");

    if (!searchParams.value) return sorted;
    const term = searchParams.value.toLowerCase();
    return sorted.filter((item) =>
      String(item[searchParams.field as keyof ServicioMcData] ?? "")
        .toLowerCase()
        .includes(term)
    );
  }, [data, searchParams]);

  // --- Lógica de Virtualización ---
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
    estimateSize: useCallback(() => (screens.md ? 220 : 450), [screens.md]),
    overscan: 5,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [itemsPerRow, rowVirtualizer]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} className="p-6" />;
  if (isError) return <Alert type="error" message="Error al cargar datos de stock" showIcon />;

  return (
    <div
      ref={parentRef}
      style={{
        height: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "0 16px",
      }}
    >
      <div className="sticky top-0 z-20 backdrop-blur-md pt-2 mb-4 border-b">
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

      {dataSource.length === 0 ? (
        <Empty description="No hay registros de stock" />
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
                  styles={{ body: { padding: "12px" } }}
                >
                  <Row gutter={16} align="middle">
                    <Col xs={24} md={8}>
                      <CarrucelImagenes
                        autoplay={false}
                        height={160}
                        fallback={defaultImage}
                        preview={true}
                        images={item.image_byte ? [item.image_byte] : []}
                      />
                    </Col>
                    <Col xs={24} md={16}>
                      <Flex vertical gap={2}>
                        <Title
                          level={5}
                          style={{ margin: 0, fontSize: "14px", width: "95%" }}
                        >
                          {item.name}
                        </Title>
                        
                        <Badge
                          count={item.categoria}
                          style={{ backgroundColor: "#853C66", fontSize: "10px" }}
                        />

                        <div className="mt-1">
                          <Text type="secondary" className="text-xs">
                            [{item.codigo}] • {item.medida}
                          </Text>
                        </div>

                        <div className="truncate">
                          <Text strong className="text-xs">{item.marca}</Text>
                          <Text type="secondary" className="text-xs"> / {item.modelo}</Text>
                        </div>

                        <Text className="text-xs">
                          <Text strong>Dimensión: </Text> {item.dimension || '-'}
                        </Text>

                        {/* Fila de Stock y Valores */}
                        <Flex gap={8} wrap="wrap" className="p-1 rounded mt-1">
                          <Text className="text-xs">
                            <Text strong>Stock: </Text> 
                            <span className={item.stock_actual <= item.plimit ? "text-red-500 font-bold" : ""}>
                              {item.stock_actual}
                            </span>
                          </Text>
                        </Flex>

                        {/* Fila de Tiempos y Ubicación */}
                        <div className="mt-1">
                          <Text className="block text-xs">
                            <Text strong> Ingreso: </Text> {isoToDDMMYYYY(item.fecha_ingreso)}
                          </Text>
                          <Text className="block text-xs truncate">
                            <Text strong>Serie: </Text> {item.serie || 'S/S'}
                          </Text>
                          <Text className="block text-xs italic text-blue-600">
                            <Text strong>Ubicación: </Text> {item.ubicacion}
                          </Text>
                        </div>
                      </Flex>
                    </Col>
                  </Row>
                </Card>
              ))}
              {rows[virtualRow.index].length < itemsPerRow && (
                <div style={{ flex: 1 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MostrarStockMercaderias;