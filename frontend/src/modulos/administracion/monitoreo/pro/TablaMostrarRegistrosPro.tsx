import { useRef, useState, useMemo, useCallback } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import {
  Flex,
  Grid,
  Input,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import Highlighter from "react-highlight-words";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";
import isoToDDMMYYYY from "../../../../helpers/Fechas";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtomNew from "../../../../components/molecules/botons/BottomNew";
import type { ProOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/pro/pro.api.schema";
import { useDeletePro, useProList } from "../../../../api/queries/modulos/administracion/monitoreo/pro/pro.api";
import UpdateproUI from "./ActualizarRegistroPro";
import CreateproUI from "./CrearRegistroPro";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

interface DataType {
  item: number;
  key: string;
  name: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  fact_rel: string;
  status: number;
  adicional: string;
  created_at: string;
}

type DataIndex = keyof DataType;

// Mapeo fuera del componente para no recrear la función
const mapProTable = (proData: ProOutApiType[]): DataType[] => {
  return proData.map((w, i) => ({
    item: i + 1,
    key: w.id.toString(),
    name: w.name ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    fact_rel: w.fact_rel ?? "-",
    status: w.status ?? -1,
    adicional: w.adicional ?? "-",
    created_at: w.created_at ?? "-",
  }));
};

function TablaMostrarRegistrosPro() {
  const screens = useBreakpoint();
  const searchInput = useRef<InputRef>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Queries
  const { data, isLoading, isError, error } = useProList();
  const { mutate, isPending } = useDeletePro();

  // --- OPTIMIZACIÓN: Memoización de datos procesados ---
  const dataSource = useMemo(() => {
    if (!data) return [];
    const tableData = mapProTable(data);
    return ordenarPorFecha(tableData, 'created_at', 'desc');
  }, [data]);

  // Handlers Modales
  const handleOpenModal = (id: number) => setSelectedUserId(id);
  const handleCloseModal = () => setSelectedUserId(null);

  // --- OPTIMIZACIÓN: Función de búsqueda estabilizada ---
  const getColumnSearchProps = useCallback((dataIndex: DataIndex): TableColumnType<DataType> => ({
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
  }), []);

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

  // --- OPTIMIZACIÓN: Memoización de columnas ---
  const columns: TableColumnsType<DataType> = useMemo(() => [
    {
      title: "N°",
      dataIndex: "item",
      key: "item",
      width: 50,
      align: "center",
      fixed: "left",
      sorter: (a, b) => a.item - b.item,
      render: (text) => <Text style={{ fontSize: "12px" }}>{text}</Text>,
    },
    {
      title: "Cliente",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "name")}</Text>
      ),
      width: 200,
      ellipsis: true,
    },
    {
      title: "Ubicación",
      dataIndex: "ubicacion",
      key: "ubicacion",
      ...getColumnSearchProps("ubicacion"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "ubicacion")}</Text>
      ),
      width: 250,
      ellipsis: true,
    },
    {
      title: "Inicio",
      dataIndex: "inicio",
      key: "inicio",
      width: 100,
      align: "center",
      ...getColumnSearchProps("inicio"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "inicio")}</Text>
      ),
    },
    {
      title: "Fin",
      dataIndex: "fin",
      key: "fin",
      width: 100,
      align: "center",
      ...getColumnSearchProps("fin"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "fin")}</Text>
      ),
    },
    {
      title: "Fact. rel.",
      dataIndex: "fact_rel",
      key: "fact_rel",
      width: 100,
      align: "center",
      ...getColumnSearchProps("fact_rel"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "fact_rel")}</Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      filters: [
        { text: "Pendiente", value: "0" },
        { text: "Renovado", value: "1" },
        { text: "No renovado", value: "2" },
      ],
      onFilter: (value, record) => record.status.toString() === value,
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: "gold", text: "PENDIENTE" },
          1: { color: "cyan", text: "RENOVADO" },
          2: { color: "red", text: "NO RENOVADO" },
        };
        const { color, text } = statusMap[status] || { color: "default", text: "DESCONOCIDO" };
        return <Tag style={{ fontSize: "10px" }} color={color}>{text}</Tag>;
      },
    },
    {
      title: "Adicional",
      dataIndex: "adicional",
      key: "adicional",
      ...getColumnSearchProps("adicional"),
      render: (text) => renderText(text, "adicional"),
      width: 100,
      ellipsis: true,
    },
    {
      title: "Acciones",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <ButtonUpdate style={{height: '28px'}} onClick={() => handleOpenModal(Number(record.key))} />
          <Popconfirm
            title="¿Eliminar Registro?"
            okText="Eliminar"
            cancelText="Cancelar"
            onConfirm={() => mutate(Number(record.key))}
            okButtonProps={{ loading: isPending }}
          >
            <ButtonDelete style={{height: '28px'}}/>
          </Popconfirm>
        </Space>
      ),
    },
  ], [getColumnSearchProps, searchText, searchedColumn, mutate, isPending]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 20 }} />;
  if (isError) return <p>{error.message}</p>;
  if (!data) return <ErrorResultServer />;

  return (
    <div>
      <Table<DataType>
        title={() => (
          <Flex justify="space-between" align="center" gap={4}>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                fontSize: screens.md ? "28px" : "18px" 
              }}
            >
              Servicios licencias Pro 
            </Title>
            <ButtomNew name="Agregar registro" onClick={() => setOpenCreateModal(true)} />
          </Flex>
        )}
        size="small"
        columns={columns}
        dataSource={dataSource}
        virtual
        pagination={{ pageSize: 12, size: "small" }}
        scroll={{ x: 1200, y: 600 }}
        rowKey="key"
        styles={{ title: { textShadow: "2px 1px 1px #EEF5C6" } }}
      />

      {/* OPTIMIZACIÓN: Renderizado condicional para liberar memoria */}
      {selectedUserId !== null && (
        <UpdateproUI
          id={selectedUserId}
          open={selectedUserId !== null}
          onClose={handleCloseModal}
        />
      )}
      
      {openCreateModal && (
        <CreateproUI
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TablaMostrarRegistrosPro;