//src/routes/Gerencia.tsx
import {
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import React, { useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import type { PermisoOutType } from "../../api/queries/auth/usuarios.api.schema";

export const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

// construccion del item de la barra de navegacion
export type AppMenuItem = MenuItem & {
  to?: string;
};

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: AppMenuItem[],
  to?: string
): AppMenuItem {
  return {
    key,
    icon,
    children,
    label,
    to,
  };
}

// Mapeo de modulos de usario activo
const customLabels: Record<string, string> = {
  gerencia: "Gerencia",
  rrhh: "Recursos Humanos",
  almacen: "Almacén",
  produccion: "Producción",
  administracion: "Administración",
  tesoreria: "Tesorería",
  contabilidad: "Contabilidad",
  ventas: "Ventas",
};

// funcion para mapear los modulos del usuario activo
export function buildModulos(permisos?: PermisoOutType[]): AppMenuItem[] {
  return (
    permisos?.map((permiso) =>
      getItem(
        customLabels[permiso.name_module] || permiso.name_module,
        `/${permiso.name_module}`,
        undefined,
        undefined,
        `/${permiso.name_module}`
      )
    ) ?? []
  );
}

// creación de los items de la barra de navegacion lateral
export interface NavNodeInterface {
  label: ReactNode;
  key: React.Key;
  icon?: ReactNode;
  to?: string;
  children?: NavNodeInterface[];
}
export function mapNavToMenu(nodes: NavNodeInterface[]): AppMenuItem[] {
  return nodes.map((node) =>
    getItem(
      node.label,
      node.key,
      node.icon,
      node.children ? mapNavToMenu(node.children) : undefined,
      node.to
    )
  );
}


// barra de navegacion lateral
interface MainLayoutProps {
  header: React.ReactNode;
  modulos: AppMenuItem[];
}

function MainLayout(props: MainLayoutProps) {
  const NameModulo = props.modulos;
  const router = useRouter();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ height: "100vh" }}>

      <Header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: 48,
          zIndex: 100,
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {props.header}
      </Header>

      <Layout style={{ marginTop: 48 }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{
            position: "fixed",
            left: 0,
            top: 48,
            height: "calc(100vh - 48px)",
            overflow: "hidden",
          }}
          trigger={
            <div style={{ background: "#7A2241" }}>
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </div>
          }
        >
          <div
            className="sider-scroll"
            style={{
              height: "100%",
              overflowY: collapsed ? "hidden" : "auto",
            }}
          >
            <Menu
              mode="inline"
              theme="dark"
              items={NameModulo}
              selectedKeys={[location.pathname]}
              onClick={({ key }) => {
                router.navigate({ to: key as string });
              }}
            />
          </div>
        </Sider>
        
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 220,
            height: "calc(100vh - 48px)",
          }}
        >
          <Content
            style={{
              margin: 0,
              padding: 4,
              overflowY: "auto",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default MainLayout;