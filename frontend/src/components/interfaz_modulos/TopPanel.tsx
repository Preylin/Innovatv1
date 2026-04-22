import { useMemo } from "react";
import {
  Avatar,
  Badge,
  Flex,
  Grid,
  Image,
  Skeleton,
  Space,
  type MenuProps,
} from "antd";
import {
  BellOutlined,
  EyeOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "@tanstack/react-router";

import logoInnovatImg from "../../assets/logoInnovat.webp";
import { defaultImage } from "../../assets/images";
import { useAuthState, useLogout } from "../../api/auth";
import CustomDropdown from "../molecules/dropdown/CustomDropdown";
import ThemeToggle from "../../Theme/ThemeToggle";
import { UseSpinnersIcons } from "../atoms/icons/OtrasLibs/Spinners";
import getBase64WithPrefix from "../../helpers/ImagesBase64";
import { ShowMessage } from "../organisms/showMessage";
import UsuariosOnline from "./MostrarUsuariosOnline";

const { useBreakpoint } = Grid;

// Normalizacion de rutas de modulos para el label
const MODULE_LABELS: Record<string, string> = {
  gerencia: "Gerencia",
  rrhh: "Recursos Humanos",
  almacen: "Almacén",
  produccion: "Producción",
  administracion: "Administración",
  tesoreria: "Tesorería",
  contabilidad: "Contabilidad",
  ventas: "Ventas",
};

interface TopPanelProps {
  title: string;
  MenuItems?: MenuProps["items"];
}

export function PanelSuperior({ title, MenuItems }: TopPanelProps) {
  const { user, isLoading } = useAuthState();
  const logout = useLogout();
  const navigate = useNavigate();
  const screens = useBreakpoint(); // Hook para detectar tamaño de pantalla

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const avatarSrc = useMemo(
    () =>
      user?.image_base64
        ? getBase64WithPrefix(user.image_base64)
        : defaultImage,
    [user?.image_base64],
  );

  const cascadingMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "grp",
        type: "group",
        label: "Configuraciones",
        children: [
          { key: "1-1", label: "Ver Perfil", icon: <EyeOutlined /> },
          { key: "1-2", label: "Ajustes", icon: <SettingOutlined /> },
          { key: "1-3", label: "Modo", icon: <ThemeToggle /> },
        ],
      },
      {
        key: "sub1",
        label: "Módulos",
        icon: <UseSpinnersIcons name="blocksScale" className="h-full mt-1" />,
        children: user?.permisos?.length
          ? user.permisos.map((p) => ({
              key: p.name_module,
              label: (
                <Link to={`/${p.name_module}` as string}>
                  {MODULE_LABELS[p.name_module] || p.name_module}
                </Link>
              ),
            }))
          : [{ key: "no-p", label: "Sin módulos", disabled: true }],
      },
      { type: "divider" },
      {
        key: "logout",
        label: "Cerrar Sesión",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
    [user?.permisos, handleLogout],
  );

  return (
    <nav className="flex h-12 w-full items-center justify-between shadow-sm">
      {/* SECCIÓN IZQUIERDA: Menu y Logo */}
      <Flex align="center" gap={screens.md ? 16 : 8} className="shrink-0" style={{paddingLeft: "9px"}}>
        {isLoading ? (
          <Skeleton.Avatar active size="small" shape="square" />
        ) : (
          <>
            <CustomDropdown
              placement="bottomLeft"
              triggerElement={
                <MenuOutlined className="cursor-pointer text-lg" style={{color: "#F7F7F7"}}/>
              }
              items={MenuItems}
            />
            <Image
              src={logoInnovatImg}
              alt="logo"
              preview={false}
              className="max-h-8 w-auto object-contain"
              style={{ height: screens.md ? "32px" : "24px" }}
            />
          </>
        )}
      </Flex>

      {/* SECCIÓN CENTRAL: Mensajes y Título (Oculto en móviles muy pequeños o truncado) */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden ">
          <ShowMessage />
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="truncate font-bold md:text-lg" style={{color: "#F7F7F7"}}>
            {title}
          </span>
        </div>
        <UsuariosOnline />

      </div>

      {/* SECCIÓN DERECHA: Iconos y Perfil */}
      <Flex align="center" gap={screens.md ? 16 : 8} className="shrink-0">
        {/* Iconos: Se ocultan en XS para no apretar el header */}
        {screens.sm && (
          <Space size={screens.md ? "middle" : "small"}>
            <Badge size="small" count={1} overflowCount={9}>
              <MessageOutlined className="cursor-pointer text-lg" style={{color: "#F7F7F7"}}/>
            </Badge>
            <Badge size="small" count={12} overflowCount={9}>
              <BellOutlined className="cursor-pointer text-lg" style={{color: "#F7F7F7"}}/>
            </Badge>
          </Space>
        )}

        {/* Avatar Container */}
        <div className="flex h-12 items-center justify-center rounded-l-md bg-[#00695C] px-3 transition-all hover:bg-[#004D40]">
          {isLoading ? (
            <Skeleton.Avatar active size="small" />
          ) : (
            <CustomDropdown
              placement="bottomRight"
              triggerElement={
                <Avatar
                  src={avatarSrc}
                  size={screens.md ? 36 : 32}
                  className="cursor-pointer border-2 border-white/20"
                />
              }
              items={cascadingMenuItems}
            />
          )}
        </div>
      </Flex>
    </nav>
  );
}
