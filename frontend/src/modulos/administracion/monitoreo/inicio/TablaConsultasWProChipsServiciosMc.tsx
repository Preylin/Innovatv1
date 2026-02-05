import { useCallback, useMemo, useRef, useState } from "react";
import { useChipServicioList } from "../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api";
import { useProList } from "../../../../api/queries/modulos/administracion/monitoreo/pro/pro.api";
import { useWeatherList } from "../../../../api/queries/modulos/administracion/monitoreo/weather/weather.api";
import {
    Flex,
  Grid,
  Input,
  Table,
  Tag,
  Typography,
  type InputRef,
  type TableColumnsType,
  type TableColumnType,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {
  mapChipServicioTableInicio,
  mapProTableInicio,
  mapServiciosMCTableInicio,
  mapWeatherToTableInicio,
  type DataIndex,
  type DataTypeInicioMonitoreo,
} from "./MapDatosTables";
import { useServiciosMCList } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function TablaConsultasWProChips() {
  const screens = useBreakpoint();
  const searchInput = useRef<InputRef>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const { data: weatherData } = useWeatherList();
  const { data: proData } = useProList();
  const { data: chipData } = useChipServicioList();
  const { data: serviciosMCData } = useServiciosMCList();


  const bigDataTable = useMemo(() => {
    const w = mapWeatherToTableInicio(weatherData ?? []);
    const p = mapProTableInicio(proData ?? []);
    const c = mapChipServicioTableInicio(chipData ?? []);
    const mc = mapServiciosMCTableInicio(serviciosMCData ?? []);


    // Unimos y re-mapeamos para asegurar una 'key' única y un número de 'itm'
    return [...w, ...p, ...c, ...mc].map((item, index) => ({
      ...item,
      key: `${item.tipTable}-${item.key}`,
      itm: index + 1,
    }));
  }, [weatherData, proData, chipData]);

  //Cantidad de registros
  const TotalRegistros = bigDataTable.length;

  const handleSearch = useCallback(
    (value: string, dataIndex: DataIndex, confirm: any) => {
      setSearchText(value);
      setSearchedColumn(dataIndex);
      confirm({ closeDropdown: false });
    },
    []
  );

  const getColumnSearchProps = useCallback(
    (dataIndex: DataIndex): TableColumnType<DataTypeInicioMonitoreo> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Buscar ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedKeys(value ? [value] : []);

              // Debounce para no saturar el renderizado
              if (typingTimer.current) clearTimeout(typingTimer.current);
              typingTimer.current = setTimeout(() => {
                handleSearch(value, dataIndex, confirm);
              }, 400);
            }}
            style={{ width: 188, display: "block", marginBottom: 8 }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
      ),
      // El onFilter debe ser síncrono para que AntD funcione bien
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase())
          : false,
    }),
    [handleSearch]
  );

  // Renderizador optimizado
  const renderHighlightedText = useCallback(
    (text: string, dataIndex: DataIndex) => {
      if (searchedColumn !== dataIndex || !searchText) return text;

      return (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      );
    },
    [searchText, searchedColumn]
  );

  const columns: TableColumnsType<DataTypeInicioMonitoreo> = useMemo(
    () => [
      {
        title: "N°",
        dataIndex: "itm",
        key: "itm",
        width: 20,
        align: "center",
      },
      {
        title: "Cliente",
        dataIndex: "name",
        width: 100,
        ellipsis: true,
        ...getColumnSearchProps("name"),
        render: (text) => (
          <Text style={{ fontSize: "11px" }}>
            {renderHighlightedText(text, "name")}
          </Text>
        ),
      },
      {
        title: "Ubicación",
        dataIndex: "ubicacion",
        ellipsis: true,
        width: 120,
        ...getColumnSearchProps("ubicacion"),
        render: (text) => (
          <Text style={{ fontSize: "11px" }}>
            {renderHighlightedText(text, "ubicacion")}
          </Text>
        ),
      },
      {
        title: "Inicio",
        dataIndex: "inicio",
        key: "inicio",
        width: 30,
        align: "center",
        ...getColumnSearchProps("inicio"),
        render: (text) => (
          <Text style={{ fontSize: "11px" }}>
            {renderHighlightedText(text, "inicio")}
          </Text>
        ),
      },
      {
        title: "Fin",
        dataIndex: "fin",
        key: "fin",
        width: 30,
        align: "center",
        ...getColumnSearchProps("fin"),
        render: (text) => (
          <Text style={{ fontSize: "11px" }}>
            {renderHighlightedText(text, "fin")}
          </Text>
        ),
      },
      {
        title: "Tabla",
        dataIndex: "tipTable",
        key: "tipTable",
        width: 30,
        align: "center",
        render: (text) => (
          <Text style={{ fontSize: "11px" }}>
            {renderHighlightedText(text, "tipTable")}
          </Text>
        ),
        filters: [
          { text: "Weather", value: "weather" },
          { text: "Pro", value: "pro" },
          { text: "Chip", value: "chip" },
          { text: "MC", value: "serviciosMC" },
        ],
        onFilter: (value, record) => record.tipTable === value,
      },
      {
        title: "Estado",
        dataIndex: "status",
        key: "status",
        width: 30,
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
          const { color, text } = statusMap[status] || {
            color: "default",
            text: "DESCONOCIDO",
          };
          return (
            <Tag color={color} style={{ fontSize: "8px" }}>
              {text}
            </Tag>
          );
        },
      },
    ],
    [getColumnSearchProps, renderHighlightedText]
  );

  return (
    <div>
      <Table<DataTypeInicioMonitoreo>
        title={() => (
          <Flex justify="space-between">
            <Title
            level={2}
            style={{
              margin: 0,
              fontSize: screens.md ? "28px" : "18px",
            }}
          >
            Consultas de servicios
          </Title>
          <Tag
            color="red"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: screens.md ? "16px" : "12px"
            }}
            >{TotalRegistros} registros</Tag>
          </Flex>
        )}
        size="small"
        columns={columns}
        dataSource={bigDataTable}
        scroll={{ x: 1000, y: 600}}
        rowKey={(record) => `${record.tipTable}-${record.key}`}
        pagination={{ pageSize: 15, size: "small" }} 
        virtual
      />
    </div>
  );
}

export default TablaConsultasWProChips;