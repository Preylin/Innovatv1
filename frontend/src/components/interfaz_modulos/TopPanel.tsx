import { useMemo } from "react";
import {
  Avatar,
  Badge,
  Col,
  Flex,
  Grid,
  Image,
  Row,
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

// Estilos mejorados para adaptabilidad
const STYLES = {
  row: { width: "100%", height: "48px", margin: 0 },
  logoCol: { height: "48px", display: "flex", alignItems: "center", padding: "0 10px"},
  logoImg: { height: "35px", width: "100%",marginLeft: "2px"},
  titleCol: {
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "black",
  },
  iconsCol: {
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "15px",
  },
  avatarCol: {
    background: "#00695C",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: "6px",
    borderBottomLeftRadius: "6px",
    cursor: "pointer",
  },
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
    <Row style={STYLES.row} align="middle" wrap={false}>
      <Col xs={6} sm={4} md={3} style={STYLES.logoCol}>
        {isLoading ? (
          <Skeleton.Avatar active size="small" shape="square" />
        ) : (
          <Flex align="center" justify="center" gap={8}>
            <CustomDropdown
              placement="bottomLeft"
              triggerElement={
                <MenuOutlined
                  style={{
                    fontSize: screens.md ? "18px" : "14px",
                    color: "black",
                    cursor: "pointer",
                  }}
                />
              }
              items={MenuItems}
            />
            <Image
              src={logoInnovatImg}
              alt="logo"
              preview={false}
              style={STYLES.logoImg}
            />
          </Flex>
        )}
      </Col>

      {/* Título: Ocupa el espacio restante. Ajusta fuente según pantalla */}
      <Col
        flex="auto"
        style={{ ...STYLES.titleCol, fontSize: screens.md ? "18px" : "14px" }}
        className="select-none"
      >
        {title}
      </Col>

      {/* Iconos de Notificación: Se ven a partir de 'sm' (tablets/móviles grandes) */}
      <Col style={STYLES.iconsCol}>
        <Space size="small">
          <Badge
            size="small"
            count={1}
            overflowCount={9}
            styles={{ indicator: { borderRadius: "4px", padding: "0 2px" } }}
          >
            <MessageOutlined
              style={{
                fontSize: screens.md ? "18px" : "14px",
                color: "black",
                cursor: "pointer",
              }}
            />
          </Badge>
          <Badge
            size="small"
            count={12}
            overflowCount={9}
            styles={{ indicator: { borderRadius: "4px", padding: "0 2px" } }}
          >
            <BellOutlined
              style={{
                fontSize: screens.md ? "18px" : "14px",
                color: "black",
                cursor: "pointer",
              }}
            />
          </Badge>
        </Space>
      </Col>

      {/* Avatar / Dropdown */}
      <Col xs={3} sm={3} md={2} lg={1} style={STYLES.avatarCol}>
        {isLoading ? (
          <Skeleton.Avatar active />
        ) : (
          <CustomDropdown
            placement="bottomLeft"
            triggerElement={<Avatar src={avatarSrc} size={42} />}
            items={cascadingMenuItems}
          />
        )}
      </Col>
    </Row>
  );
}
