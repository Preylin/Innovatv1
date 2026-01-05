import { App, Flex, Popconfirm, Skeleton, Space, Tag, type TableProps } from "antd";
import { AvatarAtom } from "../avatar/Avatar";
import { useState, type FC } from "react";
import TableAtom from "./Table";
import ButtonUpdate from "../../molecules/botons/BottonUpdate";
import { createStyles } from "antd-style";
import ModalUpdateUsuario from "../../organisms/Actualizar_usuarios_gerencia";
import ButtonDelete from "../../molecules/botons/BottonDelete";
import ErrorResultServer from "../../pages/resultado/ErrorResultServer";
import type { UsuarioOutType } from "../../../api/queries/auth/usuarios.api.schema";
import { useDeleteUsuario, useUsuariosList } from "../../../api/queries/auth/usuarios";

const useStyle = createStyles(({ css }) => {
  return {
    customTable: css`
      .ant-table {
        .ant-table-container {
          .ant-table-body,
          .ant-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
          }
        }
      }
    `,
  };
});

interface DataType {
  key: number;
  image: string;
  name: string;
  last_name: string;
  email: string;
  cargo: string;
  estado: "activo" | "bloqueado";
  permisos: string[];
}

const DEFAULT_AVATAR = "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-s%C3%ADmbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk="

const mapUsuariosToTable = (usuarios: UsuarioOutType[]): DataType[] => {
  return usuarios.map((u) => ({
    key: u.id,
    image: u.image_base64 ? `data:image/png;base64,${u.image_base64}`
      : DEFAULT_AVATAR,
    name: u.name,
    last_name: u.last_name,
    email: u.email,
    cargo: u.cargo ?? "—",
    estado: u.estado,
    permisos: u.permisos?.map((p) => p.name_module) ?? [],
  }));
};

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Imagen",
    dataIndex: "image",
    key: "image",
    render: (text) => <AvatarAtom src={text} size={50} />,
  },
  {
    title: "Nombre",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Apellidos",
    dataIndex: "last_name",
    key: "last_name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Cargo",
    dataIndex: "cargo",
    key: "cargo",
    render: (text) => (<Tag color="orange">{text.toUpperCase()}</Tag>),
  },
  {
    title: "Estado",
    dataIndex: "estado",
    key: "estado",
    render: (text) => (
      <Tag color={text === "activo" ? "cyan" : "red"}>{text.toUpperCase()}</Tag>
    ),
  },
  {
    title: "Permisos",
    dataIndex: "permisos",
    key: "permisos",
    render: (_, { permisos }) => (
      <Flex gap="small" align="center" wrap>
        {permisos.map((permiso) => {
          let color = undefined;
          switch (permiso) {
            case "gerencia":
              color = "gold";
              break;
            case "administracion":
              color = "blue";
              break;
            case "contabilidad":
              color = "green";
              break;
            case "tesoreria":
              color = "cyan";
              break;
            case "rrhh":
              color = "purple";
              break;
            case "ventas":
              color = "volcano";
              break;
            case "almacen":
              color = "lime";
              break;
            case "produccion":
              color = "magenta";
              break;
            default:
              color = "default";
              break;
          }
          return (
            <Tag color={color} key={permiso}>
              {permiso.toUpperCase()}
            </Tag>
          );
        })}
      </Flex>
    ),
  },

];

const UsuarioTable: FC = () => {
  const { styles } = useStyle();
  const { data, isLoading, isError, error } = useUsuariosList();
  const { mutate, isPending } = useDeleteUsuario();
  const { message } = App.useApp();

  // 3. Estados para controlar el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

const handleOpenModal = (id: number) => {
  setSelectedUserId(id);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedUserId(null);
};

  if (isLoading) return <Skeleton active/>;
  if (isError) return <p>{error.message}</p>;
  if (!data) return <ErrorResultServer />;

  const tableData = mapUsuariosToTable(data);
  const columnsWithActions: TableProps<DataType>["columns"] = [
      ...columns.filter(col => col.key !== 'action'), // Mantenemos las columnas previas
      {
        title: "Acciones",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            {/* Al hacer click, pasamos el ID del registro actual */}
            <ButtonUpdate onClick={() => handleOpenModal(record.key)} />
            <Popconfirm
      title="¿Eliminar usuario?"
      description="Esta acción no se puede deshacer"
      okText="Eliminar"
      cancelText="Cancelar"
      onConfirm={() =>
        mutate(record.key, {
          onSuccess: () =>
            message.success("Usuario eliminado"),
          onError: (err) =>
            message.error(err.message),
        })
      }
    >
      <ButtonDelete loading={isPending}>
      </ButtonDelete>
    </Popconfirm>
          </Space>
        ),
        fixed: "end",
        width: 100,
      },
    ];

  return (
    <div>
      <TableAtom<DataType>
      className={styles.customTable}
      columns={columnsWithActions}
      dataSource={tableData}
      rowKey="key"
      scroll={{ x: "max-content", y: "max-content" }}
      pagination={false}
    />
     {/* Modal Update */}
    {selectedUserId !== null && (
      <ModalUpdateUsuario
        id={selectedUserId}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    )}
    </div>
    
  );
};

export default UsuarioTable;
