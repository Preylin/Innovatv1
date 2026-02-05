import { useMemo, useState } from "react";
import { useWeatherList } from "../../../../api/queries/modulos/administracion/monitoreo/weather/weather.api";
import {
    mapChipServicioTableInicio,
    mapProTableInicio,
  mapServiciosMCTableInicio,
  mapWeatherToTableInicio,
  type DataTypeInicioMonitoreo,
} from "./MapDatosTables";
import {
  Alert,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  type CollapseProps,
  type TableColumnsType,
} from "antd";
import ErrorResultServer from "../../../../components/pages/resultado/ErrorResultServer";
import { UseSpinnersIcons } from "../../../../components/atoms/icons/OtrasLibs/Spinners";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import CustomCollapse from "../../../../components/atoms/collapse/CustomCollapse";
import { useProList } from "../../../../api/queries/modulos/administracion/monitoreo/pro/pro.api";
import { useChipServicioList } from "../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api";
import { useServiciosMCList } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api";

const { Text } = Typography;

function TablaShowWeatherInicio() {
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const onChange = (key: string | string[]) => {
    setActiveKeys(key);
  };

  // Función auxiliar para verificar si una llave específica está abierta
  const isOpen = (key: string) => {
    return Array.isArray(activeKeys)
      ? activeKeys.includes(key)
      : activeKeys === key;
  };

  //query
  const { data, isLoading, isError, error } = useWeatherList();

  // --- PROCESAMIENTO DE DATOS OPTIMIZADO ---
  const allDataMapped = useMemo(() => {
    if (!data) return [];
    return mapWeatherToTableInicio(data).filter((i) => i.status === 0);
  }, [data]);

  // Filtramos sobre el mapa ya creado (mucho más rápido)
  const tableDataVencidos = useMemo(
    () => allDataMapped.filter((i) => i.time < 0),
    [allDataMapped]
  );
  const tableDataHoy = useMemo(
    () => allDataMapped.filter((i) => i.time === 0),
    [allDataMapped]
  );
  const tableData1a30 = useMemo(
    () => allDataMapped.filter((i) => i.time >= 1 && i.time <= 30),
    [allDataMapped]
  );
  const tableDataMayor30 = useMemo(
    () => allDataMapped.filter((i) => i.time > 30),
    [allDataMapped]
  );

  //Total de registro
  const TotalWeather = allDataMapped.length;
  const TotalRegistrosVencidos = tableDataVencidos.length;
  const TotalRegistrosHoy = tableDataHoy.length;
  const TotalRegistros1a30 = tableData1a30.length;
  const TotalRegistrosMayor30 = tableDataMayor30.length;

  // 1. Estilos base
  const commonHeaderStyle = { fontSize: "8px", fontWeight: "bold" as const };
  const commonCellStyle = (justifyContent = "flex-start") => ({
    style: {
      fontSize: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent,
    },
  });

  // 2. Renderizador de texto común
  const renderSmallText = (text: string) => (
    <Text ellipsis={{ tooltip: text }} style={{ fontSize: "8px", margin: 0 }}>
      {text}
    </Text>
  );

  const columns: TableColumnsType<DataTypeInicioMonitoreo> = useMemo(
    () => [
      {
        title: "Cliente",
        dataIndex: "name",
        key: "name",
        width: 20,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        key: "ubicacion",
        width: 25,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Inicio",
        dataIndex: "inicio",
        key: "inicio",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Fin",
        dataIndex: "fin",
        key: "fin",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Dias",
        dataIndex: "time",
        key: "time",
        width: 10,
        align: "center",
        sorter: (a, b) => a.time - b.time,
        defaultSortOrder: "descend",
        render: (days: number) => (
          <Tag
            color="magenta"
            style={{ fontWeight: "bold", fontSize: "8px", margin: 0 }}
          >
            {Math.abs(days)}
          </Tag>
        ),
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
    ],
    []
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError) return <Alert title={error.message} type="error" />; // Mejor usar Alert o ErrorResult
  if (!data) return <ErrorResultServer />;

  const renderTable = (dataSource: DataTypeInicioMonitoreo[]) => (
    <Table<DataTypeInicioMonitoreo>
      size="small"
      columns={columns}
      dataSource={dataSource}
      scroll={{ y: 200 }}
      rowKey="key"
      pagination={false}
      virtual
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <Space>
          <Tag color="red">
            {TotalRegistrosVencidos} servicios están vencidos
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "red", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataVencidos),
      extra: isOpen("1") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "2",
      label: (
        <Space>
          <Tag color="orange">{TotalRegistrosHoy} servicios vencen hoy</Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "orange", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataHoy), // <--- CORREGIDO AQUÍ
      extra: isOpen("2") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "3",
      label: (
        <Space>
          <Tag color="blue">
            {TotalRegistros1a30} servicios vencen dentro de 1 a 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "blue", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableData1a30),
      extra: isOpen("3") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "4",
      label: (
        <Space>
          <Tag color="green">
            {TotalRegistrosMayor30} servicios vencen a más de 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "green", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataMayor30),
      extra: isOpen("4") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
  ];

  return (
    <Card
      title="Servicios de Innovat-Weather"
      styles={{ body: { padding: "5px" } }}
      extra={<Tag color="brown">{TotalWeather} pendiente(s)</Tag>}
    >
      <CustomCollapse
        items={items}
        accordion
        activeKey={activeKeys}
        onChange={onChange}
        styles={{ body: { padding: "5px" } }}
      />
    </Card>
  );
}

function TablaShowProInicio() {
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const onChange = (key: string | string[]) => {
    setActiveKeys(key);
  };

  // Función auxiliar para verificar si una llave específica está abierta
  const isOpen = (key: string) => {
    return Array.isArray(activeKeys)
      ? activeKeys.includes(key)
      : activeKeys === key;
  };

  //query
  const { data, isLoading, isError, error } = useProList();

  // --- PROCESAMIENTO DE DATOS OPTIMIZADO ---
  const allDataMapped = useMemo(() => {
    if (!data) return [];
    return mapProTableInicio(data).filter((i) => i.status === 0);
  }, [data]);

  // Filtramos sobre el mapa ya creado (mucho más rápido)
  const tableDataVencidos = useMemo(
    () => allDataMapped.filter((i) => i.time < 0),
    [allDataMapped]
  );
  const tableDataHoy = useMemo(
    () => allDataMapped.filter((i) => i.time === 0),
    [allDataMapped]
  );
  const tableData1a30 = useMemo(
    () => allDataMapped.filter((i) => i.time >= 1 && i.time <= 30),
    [allDataMapped]
  );
  const tableDataMayor30 = useMemo(
    () => allDataMapped.filter((i) => i.time > 30),
    [allDataMapped]
  );

  //Total de registro
  const TotalPro = allDataMapped.length;
  const TotalRegistrosVencidos = tableDataVencidos.length;
  const TotalRegistrosHoy = tableDataHoy.length;
  const TotalRegistros1a30 = tableData1a30.length;
  const TotalRegistrosMayor30 = tableDataMayor30.length;

  // 1. Estilos base
  const commonHeaderStyle = { fontSize: "8px", fontWeight: "bold" as const };
  const commonCellStyle = (justifyContent = "flex-start") => ({
    style: {
      fontSize: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent,
    },
  });

  // 2. Renderizador de texto común
  const renderSmallText = (text: string) => (
    <Text ellipsis={{ tooltip: text }} style={{ fontSize: "8px", margin: 0 }}>
      {text}
    </Text>
  );

  const columns: TableColumnsType<DataTypeInicioMonitoreo> = useMemo(
    () => [
      {
        title: "Cliente",
        dataIndex: "name",
        key: "name",
        width: 20,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        key: "ubicacion",
        width: 25,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Inicio",
        dataIndex: "inicio",
        key: "inicio",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Fin",
        dataIndex: "fin",
        key: "fin",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Dias",
        dataIndex: "time",
        key: "time",
        width: 10,
        align: "center",
        sorter: (a, b) => a.time - b.time,
        defaultSortOrder: "descend",
        render: (days: number) => (
          <Tag
            color="volcano"
            style={{ fontWeight: "bold", fontSize: "8px", margin: 0 }}
          >
            {Math.abs(days)}
          </Tag>
        ),
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
    ],
    []
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError) return <Alert title={error.message} type="error" />; // Mejor usar Alert o ErrorResult
  if (!data) return <ErrorResultServer />;

  const renderTable = (dataSource: DataTypeInicioMonitoreo[]) => (
    <Table<DataTypeInicioMonitoreo>
      size="small"
      columns={columns}
      dataSource={dataSource}
      scroll={{ y: 200 }}
      rowKey="key"
      pagination={false}
      virtual
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <Space>
          <Tag color="red">
            {TotalRegistrosVencidos} servicios están vencidos
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "red", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataVencidos),
      extra: isOpen("1") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "2",
      label: (
        <Space>
          <Tag color="orange">{TotalRegistrosHoy} servicios vencen hoy</Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "orange", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataHoy), // <--- CORREGIDO AQUÍ
      extra: isOpen("2") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "3",
      label: (
        <Space>
          <Tag color="blue">
            {TotalRegistros1a30} servicios vencen dentro de 1 a 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "blue", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableData1a30),
      extra: isOpen("3") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "4",
      label: (
        <Space>
          <Tag color="green">
            {TotalRegistrosMayor30} servicios vencen a más de 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "green", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataMayor30),
      extra: isOpen("4") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
  ];

  return (
    <Card
      title="Servicios de licencias Pro"
      styles={{ body: { padding: "5px" } }}
      extra={<Tag color="brown">{TotalPro} pendiente(s)</Tag>}
    >
      <CustomCollapse
        items={items}
        accordion
        activeKey={activeKeys}
        onChange={onChange}
        styles={{ body: { padding: "5px" } }}
      />
    </Card>
  );
}

function TablaShowChipServicioInicio() {
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const onChange = (key: string | string[]) => {
    setActiveKeys(key);
  };

  // Función auxiliar para verificar si una llave específica está abierta
  const isOpen = (key: string) => {
    return Array.isArray(activeKeys)
      ? activeKeys.includes(key)
      : activeKeys === key;
  };

  //query
  const { data, isLoading, isError, error } = useChipServicioList();

  // --- PROCESAMIENTO DE DATOS OPTIMIZADO ---
  const allDataMapped = useMemo(() => {
    if (!data) return [];
    return mapChipServicioTableInicio(data).filter((i) => i.status === 0);
  }, [data]);

  // Filtramos sobre el mapa ya creado (mucho más rápido)
  const tableDataVencidos = useMemo(
    () => allDataMapped.filter((i) => i.time < 0),
    [allDataMapped]
  );
  const tableDataHoy = useMemo(
    () => allDataMapped.filter((i) => i.time === 0),
    [allDataMapped]
  );
  const tableData1a30 = useMemo(
    () => allDataMapped.filter((i) => i.time >= 1 && i.time <= 30),
    [allDataMapped]
  );
  const tableDataMayor30 = useMemo(
    () => allDataMapped.filter((i) => i.time > 30),
    [allDataMapped]
  );

  //Total de registro
  const TotalServiciosMC = allDataMapped.length;
  const TotalRegistrosVencidos = tableDataVencidos.length;
  const TotalRegistrosHoy = tableDataHoy.length;
  const TotalRegistros1a30 = tableData1a30.length;
  const TotalRegistrosMayor30 = tableDataMayor30.length;

  // 1. Estilos base
  const commonHeaderStyle = { fontSize: "8px", fontWeight: "bold" as const };
  const commonCellStyle = (justifyContent = "flex-start") => ({
    style: {
      fontSize: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent,
    },
  });

  // 2. Renderizador de texto común
  const renderSmallText = (text: string) => (
    <Text ellipsis={{ tooltip: text }} style={{ fontSize: "8px", margin: 0 }}>
      {text}
    </Text>
  );

  const columns: TableColumnsType<DataTypeInicioMonitoreo> = useMemo(
    () => [
      {
        title: "Cliente",
        dataIndex: "name",
        key: "name",
        width: 20,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        key: "ubicacion",
        width: 25,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Inicio",
        dataIndex: "inicio",
        key: "inicio",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Fin",
        dataIndex: "fin",
        key: "fin",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Dias",
        dataIndex: "time",
        key: "time",
        width: 10,
        align: "center",
        sorter: (a, b) => a.time - b.time,
        defaultSortOrder: "descend",
        render: (days: number) => (
          <Tag
            color="volcano"
            style={{ fontWeight: "bold", fontSize: "8px", margin: 0 }}
          >
            {Math.abs(days)}
          </Tag>
        ),
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
    ],
    []
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError) return <Alert title={error.message} type="error" />; // Mejor usar Alert o ErrorResult
  if (!data) return <ErrorResultServer />;

  const renderTable = (dataSource: DataTypeInicioMonitoreo[]) => (
    <Table<DataTypeInicioMonitoreo>
      size="small"
      columns={columns}
      dataSource={dataSource}
      scroll={{ y: 200 }}
      rowKey="key"
      pagination={false}
      virtual
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <Space>
          <Tag color="red">
            {TotalRegistrosVencidos} servicios están vencidos
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "red", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataVencidos),
      extra: isOpen("1") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "2",
      label: (
        <Space>
          <Tag color="orange">{TotalRegistrosHoy} servicios vencen hoy</Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "orange", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataHoy), // <--- CORREGIDO AQUÍ
      extra: isOpen("2") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "3",
      label: (
        <Space>
          <Tag color="blue">
            {TotalRegistros1a30} servicios vencen dentro de 1 a 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "blue", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableData1a30),
      extra: isOpen("3") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "4",
      label: (
        <Space>
          <Tag color="green">
            {TotalRegistrosMayor30} servicios vencen a más de 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "green", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataMayor30),
      extra: isOpen("4") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
  ];

  return (
    <Card
      title="Servicios de chips"
      styles={{ body: { padding: "5px" } }}
      extra={<Tag color="brown">{TotalServiciosMC} pendiente(s)</Tag>}
    >
      <CustomCollapse
        items={items}
        accordion
        activeKey={activeKeys}
        onChange={onChange}
        styles={{ body: { padding: "5px" } }}
      />
    </Card>
  );
}

function TablaShowServicioMCInicio() {
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const onChange = (key: string | string[]) => {
    setActiveKeys(key);
  };

  // Función auxiliar para verificar si una llave específica está abierta
  const isOpen = (key: string) => {
    return Array.isArray(activeKeys)
      ? activeKeys.includes(key)
      : activeKeys === key;
  };

  //query
  const { data, isLoading, isError, error } = useServiciosMCList();

  // --- PROCESAMIENTO DE DATOS OPTIMIZADO ---
  const allDataMapped = useMemo(() => {
    if (!data) return [];
    return mapServiciosMCTableInicio(data).filter((i) => i.status === 0);
  }, [data]);

  // Filtramos sobre el mapa ya creado (mucho más rápido)
  const tableDataVencidos = useMemo(
    () => allDataMapped.filter((i) => i.time < 0),
    [allDataMapped]
  );
  const tableDataHoy = useMemo(
    () => allDataMapped.filter((i) => i.time === 0),
    [allDataMapped]
  );
  const tableData1a30 = useMemo(
    () => allDataMapped.filter((i) => i.time >= 1 && i.time <= 30),
    [allDataMapped]
  );
  const tableDataMayor30 = useMemo(
    () => allDataMapped.filter((i) => i.time > 30),
    [allDataMapped]
  );

  //Total de registro
  const TotalServiciosMC = allDataMapped.length;
  const TotalRegistrosVencidos = tableDataVencidos.length;
  const TotalRegistrosHoy = tableDataHoy.length;
  const TotalRegistros1a30 = tableData1a30.length;
  const TotalRegistrosMayor30 = tableDataMayor30.length;

  // 1. Estilos base
  const commonHeaderStyle = { fontSize: "8px", fontWeight: "bold" as const };
  const commonCellStyle = (justifyContent = "flex-start") => ({
    style: {
      fontSize: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent,
    },
  });

  // 2. Renderizador de texto común
  const renderSmallText = (text: string) => (
    <Text ellipsis={{ tooltip: text }} style={{ fontSize: "8px", margin: 0 }}>
      {text}
    </Text>
  );

  const columns: TableColumnsType<DataTypeInicioMonitoreo> = useMemo(
    () => [
      {
        title: "Cliente",
        dataIndex: "name",
        key: "name",
        width: 20,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        key: "ubicacion",
        width: 25,
        render: renderSmallText,
        onCell: () => commonCellStyle(),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Inicio",
        dataIndex: "inicio",
        key: "inicio",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Fin",
        dataIndex: "fin",
        key: "fin",
        width: 10,
        align: "center",
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
      {
        title: "Dias",
        dataIndex: "time",
        key: "time",
        width: 10,
        align: "center",
        sorter: (a, b) => a.time - b.time,
        defaultSortOrder: "descend",
        render: (days: number) => (
          <Tag
            color="volcano"
            style={{ fontWeight: "bold", fontSize: "8px", margin: 0 }}
          >
            {Math.abs(days)}
          </Tag>
        ),
        onCell: () => commonCellStyle("center"),
        onHeaderCell: () => ({ style: commonHeaderStyle }),
      },
    ],
    []
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (isError) return <Alert title={error.message} type="error" />; // Mejor usar Alert o ErrorResult
  if (!data) return <ErrorResultServer />;

  const renderTable = (dataSource: DataTypeInicioMonitoreo[]) => (
    <Table<DataTypeInicioMonitoreo>
      size="small"
      columns={columns}
      dataSource={dataSource}
      scroll={{ y: 200 }}
      rowKey="key"
      pagination={false}
      virtual
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <Space>
          <Tag color="red">
            {TotalRegistrosVencidos} servicios están vencidos
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "red", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataVencidos),
      extra: isOpen("1") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "2",
      label: (
        <Space>
          <Tag color="orange">{TotalRegistrosHoy} servicios vencen hoy</Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "orange", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataHoy), // <--- CORREGIDO AQUÍ
      extra: isOpen("2") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "3",
      label: (
        <Space>
          <Tag color="blue">
            {TotalRegistros1a30} servicios vencen dentro de 1 a 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "blue", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableData1a30),
      extra: isOpen("3") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
    {
      key: "4",
      label: (
        <Space>
          <Tag color="green">
            {TotalRegistrosMayor30} servicios vencen a más de 30 días
          </Tag>
          <UseSpinnersIcons
            name="pulse1"
            style={{ color: "green", width: "25px", height: "25px" }}
          />
        </Space>
      ),
      children: renderTable(tableDataMayor30),
      extra: isOpen("4") ? <EyeOutlined /> : <EyeInvisibleOutlined />,
    },
  ];

  return (
    <Card
      title="Servicios de Mantenimiento y Calibración"
      styles={{ body: { padding: "5px" } }}
      extra={<Tag color="brown">{TotalServiciosMC} pendiente(s)</Tag>}
    >
      <CustomCollapse
        items={items}
        accordion
        activeKey={activeKeys}
        onChange={onChange}
        styles={{ body: { padding: "5px" } }}
      />
    </Card>
  );
}

function PanelCollapseShowTables() {
  return (
    <Row gutter={8} >
      <Col xs={24} md={24} lg={12} style={{marginBottom: '8px'}} >
      <TablaShowWeatherInicio />
      </Col>
      <Col span={24} md={24} lg={12} style={{marginBottom: '8px'}}>
      <TablaShowProInicio />
      </Col>
      <Col span={24} md={24} lg={12} style={{marginBottom: '8px'}}>
      <TablaShowChipServicioInicio />
      </Col>
      <Col span={24} md={24} lg={12} style={{marginBottom: '8px'}}>
      <TablaShowServicioMCInicio />
      </Col>
    </Row>
  );
}

export default PanelCollapseShowTables;
