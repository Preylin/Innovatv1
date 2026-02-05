//src/routes/Gerencia.tsx
import {
  Link,
  Outlet,
} from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Flex, Layout, theme } from "antd";
import type { ReactNode } from "react";

const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

// construccion del item de la barra de navegacion
export type AppMenuItem = MenuItem & {
  to?: string;
};

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: AppMenuItem[],
  to?: string,
): AppMenuItem {
  return {
    key,
    icon,
    children,
    label: to ? (
      <Link to={to} style={{color: "inherit", textDecoration: "none" }}>
        {label}
      </Link>
    ) : (
      label
    ),
    to,
  };
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
}

function MainLayout(props: MainLayoutProps) {

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
        <Flex style={{width: '100%', height: '48px', background: '#CCCCCC'}}>
          {props.header}
        </Flex>
      </Header>

      <Layout style={{ marginTop: 48}}>

        
        <Layout
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