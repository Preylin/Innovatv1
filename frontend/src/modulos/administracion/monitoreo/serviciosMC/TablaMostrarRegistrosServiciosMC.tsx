import { Flex, Grid, Input, Popconfirm, Skeleton, Space, Table, Tag, Typography, type InputRef, type TableColumnsType, type TableColumnType } from "antd";
import { useDeleteServiciosMC, useServiciosMCList } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api";
import isoToDDMMYYYY from "../../../../helpers/Fechas";
import type { ServiciosMCOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api.schema";
import { useCallback, useMemo, useRef, useState } from "react";
import { ordenarPorFecha } from "../../../../helpers/OrdenacionAscDscPorFechasISO";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";
import ButtomNew from "../../../../components/molecules/botons/BottomNew";
import ModalCreateServiciosMc from "./ModalCreateServiciosMC";
import ModalUpdateServiciosMc from "./ModalActualizarRegistroServicioMC";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

interface DataType {
  item: number;
  key: string;
  empresa: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  servicio: string;
  informe: string;
  certificado: string;
  encargado: string;
  tecnico: string;
  status: number;
  incidencia: string;
  created_at: string;
}

type DataIndex = keyof DataType;

// Mapeo fuera del componente para no recrear la función
const mapServiciosMCTable = (proData: ServiciosMCOutApiType[]): DataType[] => {
  return proData.map((w, i) => ({
    item: i + 1,
    key: w.id.toString(),
    empresa: w.empresa ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    servicio: w.servicio ?? "-",
    informe: w.informe ?? "-",
    certificado: w.certificado ?? "-",
    encargado: w.encargado ?? "-",
    tecnico: w.tecnico ?? "-",
    status: w.status ?? 0,
    incidencia: w.incidencia ?? "-",
    created_at: w.created_at ?? "-",
  }));
};

function TablaMostrarRegistrosMc() {
  const screens = useBreakpoint();
  const searchInput = useRef<InputRef>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Queries
  const { data, isLoading, isError, error } = useServiciosMCList();
  const { mutate, isPending } = useDeleteServiciosMC();

  // --- OPTIMIZACIÓN: Memoización de datos procesados ---
  const dataSource = useMemo(() => {
    if (!data) return [];
    const tableData = mapServiciosMCTable(data);
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
      dataIndex: "empresa",
      key: "empresa",
      ...getColumnSearchProps("empresa"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "empresa")}</Text>
      ),
      width: 100,
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
      width: 150,
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
      title: "Informe",
      dataIndex: "informe",
      key: "informe",
      width: 100,
      align: "center",
      ellipsis: true,
      ...getColumnSearchProps("informe"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "informe")}</Text>
      ),
    },
    {
      title: "Certificado",
      dataIndex: "certificado",
      key: "certificado",
      width: 100,
      align: "center",
      ellipsis: true,
      ...getColumnSearchProps("certificado"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "certificado")}</Text>
      ),
    },
    {
      title: "Encargado",
      dataIndex: "encargado",
      key: "encargado",
      width: 100,
      align: "center",
      ellipsis: true,
      ...getColumnSearchProps("encargado"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "encargado")}</Text>
      ),
    },
    {
      title: "Técnico",
      dataIndex: "tecnico",
      key: "tecnico",
      width: 100,
      align: "center",
      ellipsis: true,
      ...getColumnSearchProps("tecnico"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "tecnico")}</Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      title: "Servicio",
      dataIndex: "servicio",
      key: "servicio",
      ...getColumnSearchProps("servicio"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "servicio")}</Text>
      ),
      width: 100,
      ellipsis: true,
    },
    {
      title: "Incidencias",
      dataIndex: "incidencia",
      key: "incidencia",
      ...getColumnSearchProps("incidencia"),
      render: (text) => (
        <Text style={{ fontSize: "12px" }}>{renderText(text, "incidencia")}</Text>
      ),
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
              Servicios de Mantenimiento y Calibración
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
        <ModalUpdateServiciosMc
          id={selectedUserId}
          open={selectedUserId !== null}
          onClose={handleCloseModal}
        />
      )}
      
      {openCreateModal && (
        <ModalCreateServiciosMc
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TablaMostrarRegistrosMc;