//src/routes/Gerencia.tsx
import {
  Link,
  Outlet,
} from "@tanstack/react-router";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";


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

  return (
    <div>
        <div className="flex flex-col w-full h-dvh overflow-hidden"> 
          <header className="bg-mist-950 dark:bg-mist-800 w-full h-12 flex items-center shrink-0 shadow-md z-50">
          {props.header}
          </header>
          <section className="flex-1 p-1 overflow-auto relative bg-mist-100 dark:bg-mist-950">
            <Outlet />
          </section>
        </div>
    
    </div>
  );
}

export default MainLayout;