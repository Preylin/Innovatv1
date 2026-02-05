import { useState, useMemo } from "react";
import {
  App,
  Button,
  Flex,
  Grid,
  Image,
  Popconfirm,
  Popover,
  Skeleton,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";

// Componentes Propios
import { AvatarAtom } from "../../../components/atoms/avatar/Avatar";
import ButtonUpdate from "../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../components/molecules/botons/BottonDelete";
import ButtonNew from "../../../components/molecules/botons/BottomNew";
import ErrorResultServer from "../../../components/pages/resultado/ErrorResultServer";
import ModalAddNewUser from "./Crear_usuarios_gerencia";
import ModalUpdateUsuario from "./Actualizar_usuarios_gerencia";

// Hooks y Tipos
import {
  useDeleteUsuario,
  useUsuariosList,
} from "../../../api/queries/auth/usuarios";
import { defaultImage } from "../../../assets/images";
import getBase64WithPrefix from "../../../helpers/ImagesBase64";


const { Title } = Typography;
const { useBreakpoint } = Grid;

// --- Tipado e Interfaces ---
interface DataType {
  item: number;
  key: number;
  image: string;
  name: string;
  last_name: string;
  email: string;
  cargo: string;
  estado: "activo" | "bloqueado";
  permisos: string[];
}

// --- Constantes de Configuración ---
const PERMISO_COLORS: Record<string, string> = {
  gerencia: "gold",
  administracion: "blue",
  contabilidad: "green",
  tesoreria: "cyan",
  rrhh: "purple",
  ventas: "volcano",
  almacen: "lime",
  produccion: "magenta",
};

function UsuarioTable() {
  const { message } = App.useApp();
  const screens = useBreakpoint();

  // --- Estados ---
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // --- Queries y Mutaciones ---
  const { data, isLoading, isError } = useUsuariosList();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUsuario();

  // --- 1. Optimización: Memoizar la transformación de datos ---
  // Esto evita que el .map() se ejecute si el componente se re-renderiza por otras razones (como abrir un modal)
  const dataSource = useMemo(() => {
    if (!data) return [];
    return data.map((u, i) => ({
      item: i + 1,
      key: u.id,
      image: u.image_base64
        ? getBase64WithPrefix(u.image_base64)
        : defaultImage,
      name: u.name,
      last_name: u.last_name,
      email: u.email,
      cargo: u.cargo ?? "—",
      estado: u.estado,
      permisos: u.permisos?.map((p) => p.name_module) ?? [],
    }));
  }, [data]);

  // --- 2. Optimización: Memoizar las columnas ---
  const columns: TableColumnsType<DataType> = useMemo(
    () => [
      {
        title: "Itm",
        dataIndex: "item",
        key: "item",
        width: 60,
        align: "center",
        sorter: (a, b) => a.item - b.item,
      },
      {
        title: "Imagen",
        dataIndex: "image",
        key: "image",
        width: 80,
        align: "center",
        fixed: "left",
        render: (src) => (
          <Popover
            content={<Image src={src} width={70} height={60} />}
            trigger="hover"
            placement="right"
          >
            <AvatarAtom src={src} size={30} />
          </Popover>
        ),
      },
      {
        title: "Nombre",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "Apellidos",
        dataIndex: "last_name",
        key: "last_name",
        ellipsis: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: true,
      },
      {
        title: "Cargo",
        dataIndex: "cargo",
        key: "cargo",
        align: "center",
        render: (cargo) => <Tag color="orange">{cargo.toUpperCase()}</Tag>,
      },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        align: "center",
        render: (estado) => (
          <Tag color={estado === "activo" ? "cyan" : "red"}>
            {estado.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Permisos",
        dataIndex: "permisos",
        key: "permisos",
        align: "center",
        render: (permisos: string[]) => (
          <Popover
            content={
              <Flex vertical gap={4}>
                {permisos.map((p) => (
                  <Tag color={PERMISO_COLORS[p] || "default"} key={p}>
                    {p.toUpperCase()}
                  </Tag>
                ))}
              </Flex>
            }
            trigger="hover"
            placement="left"
          >
            <Button icon={<UnorderedListOutlined />} />
          </Popover>
        ),
      },
      {
        title: "Acciones",
        key: "action",
        fixed: "end",
        width: 100,
        align: "center",
        render: (_, record) => (
          <Flex gap={8} justify="center">
            <ButtonUpdate onClick={() => setSelectedUserId(record.key)} />
            <Popconfirm
              title="¿Eliminar usuario?"
              description="Esta acción no se puede deshacer"
              okText="Eliminar"
              cancelText="Cancelar"
              onConfirm={() =>
                deleteUser(record.key, {
                  onSuccess: () => message.success("Usuario eliminado correctamente"),
                  onError: (err) => message.error(err.message),
                })
              }
            >
              <ButtonDelete loading={isDeleting} />
            </Popconfirm>
          </Flex>
        ),
      },
    ],
    [isDeleting, deleteUser, message]
  );

  // --- Renderizado Condicional ---
  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (isError) return <ErrorResultServer />;
  if (!data) return <ErrorResultServer />;

  return (
    <>
      <Table<DataType>
        title={() => (
          <Flex justify="space-between" align="center" gap={2}>
            <Title
              level={2}
              style={{
                margin: 0,
                color: "#6E3535",
                fontSize: screens.md ? "30px" : "1.2rem",
                textShadow: "2px 1px 1px #EEF5C6",
              }}
            >
              Panel de Control de Usuarios
            </Title>
            <ButtonNew
              name="Agregar Usuario"
              onClick={() => setOpenCreateModal(true)}
            />
          </Flex>
        )}
        columns={columns}
        dataSource={dataSource}
        size="middle"
        rowKey="key"
        scroll={{ x: 1200, y: 600 }}
        pagination={false}
        virtual
      />

      {/* Modales */}
      <ModalAddNewUser
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />

      {selectedUserId !== null && (
        <ModalUpdateUsuario
          id={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}

export default UsuarioTable;