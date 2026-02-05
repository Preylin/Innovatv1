import {
  Alert,
  Empty,
  Flex,
  Image,
  Input,
  Popconfirm,
  Skeleton,
  Table,
  Typography,
  type InputRef,
  type TableColumnsType,
  type TableColumnType,
} from "antd";
import {
  useCatalogoIngresoMercaderiaList,
  useDeteteIngresoMercaderia,
} from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import ButtomNew from "../../../../components/molecules/botons/BottomNew";
import ComponenteRegistrarProductosFinal from "./ModalRegistrarIngresoMercaderia";
import { useCallback, useMemo, useRef, useState } from "react";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import type { RegistrarIngresoMercaderiaOutApiType } from "../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import isoToDDMMYYYY from "../../../../helpers/Fechas";
import getBase64WithPrefix from "../../../../helpers/ImagesBase64";

const { Text } = Typography;

interface IngresoMercaderiaData {
  key: number;
  ruc: string;
  proveedor: string;
  serieNumCP: string;
  serieNumGR: string;
  condicion: string;
  fecha: string;
  codigo: string;
  name: string;
  marca: string;
  modelo: string;
  medida: string;
  dimension: string;
  categoria: string;
  serie: string;
  cantidad: number;
  valor: string;
  total: string;
  imagen: string;
  ubicacion: string;
  created_at: string;
}

type DataIndex = keyof IngresoMercaderiaData;

// Mapeo de los datos de la peticion get S/ $

const mapChipServicioTable = (
  proData: RegistrarIngresoMercaderiaOutApiType[],
): IngresoMercaderiaData[] => {
  return proData.map((w) => ({
    key: w.id,
    ruc: w.ruc ?? "-",
    proveedor: w.proveedor ?? "-",
    serieNumCP: w.serieNumCP ?? "-",
    serieNumGR: w.serieNumGR ?? "-",
    condicion: w.condicion ?? "-",
    fecha: isoToDDMMYYYY(w.fecha) ?? "-",
    codigo: w.codigo ?? "-",
    name: w.name ?? "-",
    marca: w.marca ?? "-",
    modelo: w.modelo ?? "-",
    medida: w.medida ?? "-",
    dimension: w.dimension ?? "-",
    categoria: w.categoria ?? "-",
    serie: w.serie ?? "-",
    cantidad: (w.cantidad ?? undefined),
    valor: `${w.moneda ?? undefined} ${(w.valor ?? undefined).toFixed(2)}`,
    total: `${w.moneda ?? undefined} ${((w.cantidad ?? 0) * (w.valor ?? 0)).toFixed(2)}`,
    imagen: w.image_byte ? getBase64WithPrefix(w.image_byte) : "-",
    ubicacion: w.ubicacion ?? "-",
    created_at: w.created_at ?? "-",
  }));
};

function TablaMostrarIngresoMercaderia() {
  const searchInput = useRef<InputRef>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  //Estados
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);

  //Queries
  const { data, isLoading, isError } =
    useCatalogoIngresoMercaderiaList();
  const { mutate, isPending } = useDeteteIngresoMercaderia();

  //Memoizacion de datos procesados
  const dataSource = useMemo(() => {
    if (!data) return [];
    const tableData = mapChipServicioTable(data);
    return ordenarPorFecha(tableData, "created_at", "desc");
  }, [data]);

  //Busqueda estabilizada
  const getColumnSearchProps = useCallback(
    (dataIndex: DataIndex): TableColumnType<IngresoMercaderiaData> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Buscar ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedKeys(value ? [value] : []);
              if (typingTimer.current) clearTimeout(typingTimer.current);
              typingTimer.current = setTimeout(() => {
                setSearchText(value);
                setSearchedColumn(dataIndex);
                confirm({ closeDropdown: false });
              }, 600);
            }}
            style={{ width: 188, display: "block" }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
    }),
    [],
  );

  const renderText = (text: string, dataIndex: DataIndex) => {
    return searchedColumn === dataIndex ? (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ""}
      />
    ) : (
      text
    );
  };

  //Memoizacion de columnas

  const columns: TableColumnsType<IngresoMercaderiaData> = useMemo(
    () => [
      {
        title: "Imagen",
        key: "imagen",
        width: 45,
        align: "center",
        render: (_, record) => (
          <Flex align="center" justify="center">
            <Image width={30} height={25} src={record.imagen} />
          </Flex>
        ),
      },
      {
        title: "Descripción",
        dataIndex: "name",
        key: "name",
        width: 120,
        ...getColumnSearchProps("name"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "name")}
          </Text>
        ),
      },
      {
        title: "Marca",
        dataIndex: "marca",
        key: "marca",
        width: 80,
        ...getColumnSearchProps("marca"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "marca")}
          </Text>
        ),
      },
      {
        title: "Modelo",
        dataIndex: "modelo",
        key: "modelo",
        width: 80,
        ...getColumnSearchProps("modelo"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "modelo")}
          </Text>
        ),
      },
      {
        title: "Medida",
        dataIndex: "medida",
        key: "medida",
        width: 80,
        ...getColumnSearchProps("medida"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "medida")}
          </Text>
        ),
      },
      {
        title: "Dimensión",
        dataIndex: "dimension",
        key: "dimension",
        width: 80,
        ...getColumnSearchProps("dimension"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "dimension")}
          </Text>
        ),
      },
      {
        title: "Categoría",
        dataIndex: "categoria",
        key: "categoria",
        width: 80,
        ...getColumnSearchProps("categoria"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "categoria")}
          </Text>
        ),
      },
      {
        title: "Serie",
        dataIndex: "serie",
        key: "serie",
        width: 80,
        ...getColumnSearchProps("serie"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "serie")}
          </Text>
        ),
      },
      {
        title: "Cantidad",
        dataIndex: "cantidad",
        key: "cantidad",
        width: 70,
        ...getColumnSearchProps("cantidad"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "cantidad")}
          </Text>
        ),
      },
      {
        title: "Valor",
        dataIndex: "valor",
        key: "valor",
        width: 80,
        ...getColumnSearchProps("valor"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "valor")}
          </Text>
        ),
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        width: 80,
        ...getColumnSearchProps("total"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "total")}
          </Text>
        ),
      },
      {
        title: "Fecha",
        dataIndex: "fecha",
        key: "fecha",
        width: 80,
        ...getColumnSearchProps("fecha"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "fecha")}
          </Text>
        ),
      },
      {
        title: "RUC",
        dataIndex: "ruc",
        key: "ruc",
        width: 80,
        ...getColumnSearchProps("ruc"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "ruc")}
          </Text>
        ),
      },
      {
        title: "Proveedor",
        dataIndex: "proveedor",
        key: "proveedor",
        width: 120,
        ...getColumnSearchProps("proveedor"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "proveedor")}
          </Text>
        ),
      },
      {
        title: "Serie CP",
        dataIndex: "serieNumCP",
        key: "serieNumCP",
        width: 80,
        ...getColumnSearchProps("serieNumCP"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "serieNumCP")}
          </Text>
        ),
      },
      {
        title: "Serie GR",
        dataIndex: "serieNumGR",
        key: "serieNumGR",
        width: 80,
        ...getColumnSearchProps("serieNumGR"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "serieNumGR")}
          </Text>
        ),
      },
      {
        title: "Condición",
        dataIndex: "condicion",
        key: "condicion",
        width: 80,
        ...getColumnSearchProps("condicion"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "condicion")}
          </Text>
        ),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        key: "ubicacion",
        width: 80,
        ...getColumnSearchProps("ubicacion"),
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ fontSize: "12px" }}>
            {renderText(text, "ubicacion")}
          </Text>
        ),
      },
      {
        title: "Acciones",
        key: "action",
        width: 50,
        align: "center",
        fixed: "right",
        render: (_, record) => (
          <Popconfirm
            title="¿Eliminar Registro?"
            okText="Eliminar"
            cancelText="Cancelar"
            onConfirm={() => mutate(Number(record.key))}
            okButtonProps={{ loading: isPending }}
          >
            <ButtonDelete style={{ height: "28px" }} />
          </Popconfirm>
        ),
      },
    ],
    [getColumnSearchProps, searchText, searchedColumn, mutate, isPending],
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 20 }} />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;

  return (
    <div>
      <div className="pb-2">
        <ButtomNew
        name="Agregar nuevo"
        onClick={() => setOpenCreateModal(true)}
      />
      </div>
      {dataSource.length === 0 ? (
        <Empty description="No hay registros" />
      ) : (
        <Table<IngresoMercaderiaData>
          size="small"
          columns={columns}
          dataSource={dataSource}
          virtual
          pagination={{ pageSize: 12, size: "small" }}
          scroll={{ x: 2300, y: 600 }}
          rowKey="key"
          styles={{ title: { textShadow: "2px 1px 1px #EEF5C6" } }}
        />
      )}

      {openCreateModal && (
        <ComponenteRegistrarProductosFinal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TablaMostrarIngresoMercaderia;
