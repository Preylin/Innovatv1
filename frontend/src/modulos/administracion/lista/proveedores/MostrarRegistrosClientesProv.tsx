import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Dropdown,
  Empty,
  Flex,
  Grid,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Typography,
  type MenuProps,
} from "antd";
import { SearchBar } from "../../../../components/molecules/input/SearchBar";
import { useToggle, useUpdateModal } from "../../../../hooks/Toggle";
import { MoreOutlined } from "@ant-design/icons";
import ModalCreateProveedoresLista from "./ModalListaCreateListaProv";
import ModalUpdateProveedoresLista from "./ModalListaUpdateListaProv";
import ButtonUpdate from "../../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../../components/molecules/botons/BottonDelete";
import type { ProveedoresListaOutApiType } from "../../../../api/queries/modulos/administracion/lista/proveedores/provedoresLista.api.schema";
import { useDeleteProveedoresLista, useProveedoresListaList } from "../../../../api/queries/modulos/administracion/lista/proveedores/proveedoresLista.api";
import ProveedorListImportMasiva from "./ModalImportacionMasivaProveedores";

const { Text } = Typography;
const { useBreakpoint } = Grid;

// 1. Tipado corregido (string en minúscula)
interface DataType {
  id: number;
  ruc: string;
  proveedor: string;
  dfiscal: string;
  adicional: string[];
}

type ProveedoresSearch = keyof DataType;

interface SearchParams {
  field: ProveedoresSearch;
  value: string;
}

const SEARCH_OPTIONS: { label: string; value: ProveedoresSearch }[] = [
  { label: "RUC", value: "ruc" },
  { label: "Proveedor", value: "proveedor" },
  { label: "Dirección Fiscal", value: "dfiscal" },
  { label: "Adicional", value: "adicional" },
];

// 2. Función de conversión fuera para evitar recreación innecesaria
const convertToDataType = (data: ProveedoresListaOutApiType[]): DataType[] => {
  return data.map((item) => ({
    id: item.id ?? undefined,
    ruc: item.ruc ?? "",
    proveedor: item.proveedor.toUpperCase() ?? "",
    dfiscal: item.dfiscal ?? "",
    adicional: [
      item.contacto1,
      item.contacto2,
      item.contacto3,
      item.contacto4,
      item.contacto5,
      item.otro1,
      item.otro2,
      item.otro3,
      item.otro4,
      item.otro5,
    ].filter((val): val is string => !!val),
  }));
};

function MostrarProveedoresList() {
  const CreateDialog = useToggle();
  const ImportMasivo = useToggle();
  const UpdateDialog = useUpdateModal();
  const screens = useBreakpoint();
  const { message } = App.useApp();

  const { data, isLoading, isError } = useProveedoresListaList();
  const { mutate, isPending } = useDeleteProveedoresLista();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    field: "proveedor",
    value: "",
  });

  const handleSearch = useCallback(
    (params: { field: string; value: string }) => {
      setSearchParams(params as SearchParams);
    },
    [],
  );
  const getMenuItems = (id: number): MenuProps["items"] => [
    {
      key: "edit",
      icon: <ButtonUpdate style={{ margin: "0px" }}/>,
      onClick: () => UpdateDialog.handlerOpen(id),
    },
    {
        key: "delete",
        label:(
            <Popconfirm
          title="¿Eliminar registro?"
          description="Esta acción no se puede deshacer"
          onConfirm={() =>
            mutate(id, {
              onSuccess: () => message.success("Registro eliminado"),
              onError: (err) => message.error(err.message),
            })
          }
          okText="Eliminar"
          cancelText="Cancelar"
          okButtonProps={{ loading: isPending, danger: true }}
        >
          <ButtonDelete style={{ margin: "0px" }}/>
        </Popconfirm>
        )
    }
  ];

  const cardFlexStyle = useMemo(() => {
    if (screens.lg)
      return { flex: "0 0 calc(33.33% - 12px)", minWidth: "300px" };
    if (screens.md) return { flex: "0 0 calc(50% - 12px)", minWidth: "300px" };
    return { flex: "1 1 100%", minWidth: "100%" };
  }, [screens]);

  // 3. Memoización de los datos convertidos
  const allData = useMemo(() => (data ? convertToDataType(data) : []), [data]);

  // 4. Lógica de filtrado corregida
  const filteredData = useMemo(() => {
    const { field, value } = searchParams;
    if (!value) return allData;

    const term = value.toLowerCase();

    return allData.filter((item) => {
      if (field === "adicional") {
        return item.adicional.some((u) => u.toLowerCase().includes(term));
      }

      // Acceso seguro: tratamos el valor como string
      const valToSearch = item[field];
      return Array.isArray(valToSearch)
        ? false
        : String(valToSearch ?? "")
            .toLowerCase()
            .includes(term);
    });
  }, [allData, searchParams]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return <Alert type="error" title="Error al cargar datos" showIcon />;  

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4 pt-2 px-6 shadow-sm mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              options={SEARCH_OPTIONS}
              onSearch={handleSearch}
              defaultField="proveedor"
            />
          </div>
          <Space>
          <Button type="primary" onClick={() => CreateDialog.toggle()}>
            Crear proveedor
          </Button>
            <Button type="primary" onClick={() => ImportMasivo.toggle()}>
              Importar Masivo
            </Button>
          </Space>
        </div>
      </div>
      <Flex wrap="wrap" justify="start" gap={12}>
        {filteredData.length > 0 ? (
          filteredData.map((proveedor) => (
            <Card
              key={proveedor.id}
              className="w-80 shadow-sm"
              hoverable
              style={cardFlexStyle}
              styles={{
                body: {
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                },
              }}
            >
              <div
                style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
              >
                <Dropdown
                  menu={{ items: getMenuItems(proveedor.id) }}
                  trigger={["click"]}
                  styles={{ item: { padding: "3px 0px" } }}
                >
                  <MoreOutlined
                    style={{
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "#8c8c8c",
                    }}
                  />
                </Dropdown>
              </div>
              <Flex vertical gap={4}>
                <Text strong className="text-lg">
                  {proveedor.proveedor}
                </Text>
                <Text type="secondary">RUC: {proveedor.ruc}</Text>
                {proveedor.dfiscal && (
                  <Text type="secondary">Dirección Fiscal: {proveedor.dfiscal}</Text>
                )}

                {proveedor.adicional.length > 0 && (
                  <fieldset className="mt-2 flex flex-col gap-2 border border-teal-600/30 p-3 rounded-md">
                    <legend className="px-2 text-xs font-medium text-teal-700">
                      Información adicional:
                    </legend>
                    <Flex wrap="wrap" gap={4}>
                      {proveedor.adicional.map((u, index) => (
                        <Tag
                          key={index}
                          color="#634D46"
                          className="m-0 max-w-full"
                          style={{
                            whiteSpace: "normal",
                            height: "auto",
                            padding: "2px 8px",
                          }}
                        >
                          {u}
                        </Tag>
                      ))}
                    </Flex>
                  </fieldset>
                )}
              </Flex>
            </Card>
          ))
        ) : (
          <Empty description="No coinciden resultados con la búsqueda" />
        )}
      </Flex>
      {/* Modales condicionales */}
      {CreateDialog.isToggled && (
        <ModalCreateProveedoresLista
          open={CreateDialog.isToggled}
          onClose={() => CreateDialog.setOff()}
        />
      )}
      {UpdateDialog.data !== null && (
        <ModalUpdateProveedoresLista
          id={UpdateDialog.data as number}
          open={UpdateDialog.isToggled}
          onClose={() => UpdateDialog.handlerClose()}
        />
      )}
      {ImportMasivo.isToggled && (
        <ProveedorListImportMasiva
          open={ImportMasivo.isToggled}
          onClose={() => ImportMasivo.setOff()}
        />
      )}
    </div>
  );
}

export default MostrarProveedoresList;
