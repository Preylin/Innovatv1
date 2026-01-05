import { createFileRoute } from '@tanstack/react-router'
import MainLayout, { buildModulos, getItem, mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { LazyIcon } from '../components/atoms/icons/IconsSiderBar';
import { useAuthState } from '../api/auth';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import {SlackOutlined,} from "@ant-design/icons";

export const Route = createFileRoute('/tesoreria')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <MainLayout header={<PanelSuperior title="TESORERÍA" />} modulos={useSiderBarContent()} />
  )
}


function useSiderBarContent(): AppMenuItem[] {
  const { user } = useAuthState();

  const nav: NavNodeInterface[] = [
    {
      label: "Movimiento de efectivo",
      key: "movimiento",
      icon: <LazyIcon name="Ordenes" />,
      children: [
        {
          label: "Caja Chica",
          key: "/tesoreria/movimiento/caja",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/tesoreria/movimiento/caja",
        },
        {
          label: "BCP soles",
          key: "/tesoreria/movimiento/soles",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/tesoreria/movimiento/soles",
        },
        {
          label: "BCP dólares",
          key: "/tesoreria/movimiento/dolares",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/tesoreria/movimiento/dolares",
        },

      ],
    },
    
    {
      label: "Cuentas por cobrar",
      key: "/tesoreria/cobrar",
      icon: <LazyIcon name="Ordenes" />,
      to: "/tesoreria/cobrar",
    },
    {
      label: "Cuentas por pagar",
      key: "pagar",
      icon: <LazyIcon name="Ordenes" />,
      to: "/tesoreria/pagar",
    },
  ];

  const baseMenu = mapNavToMenu(nav);

  return [
    ...baseMenu,
    getItem(
      "Módulos",
      "modulos",
      <SlackOutlined />,
      buildModulos(user?.permisos)
    ),
  ];
}
