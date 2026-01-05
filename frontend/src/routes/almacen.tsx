import { createFileRoute, redirect } from '@tanstack/react-router'
import MainLayout, { buildModulos, getItem, mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import { useAuthState } from '../api/auth';
import { LazyIcon } from '../components/atoms/icons/IconsSiderBar';
import {SlackOutlined,} from "@ant-design/icons";

export const Route = createFileRoute('/almacen')({
  beforeLoad: async ({ context }) => {
      const auth = context.auth;
      await auth.ensureReady();
  
      if (!auth.isAuthenticated) {
      throw redirect({ to: "/" });
      }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <MainLayout header={<PanelSuperior title="ALMACÉN" />} modulos={useSiderBarContent()} />
  )
}


function useSiderBarContent(): AppMenuItem[] {
  const { user } = useAuthState();

  const nav: NavNodeInterface[] = [
    {
      label: "Inicio",
      key: "inicio",
      icon: <LazyIcon name="Actividades" />,
      to: "/almacen/inicio",
    },
    {
      label: "Stock",
      key: "stock",
      icon: <LazyIcon name="Actividades" />,
      to: "/almacen/stock",
    },
    {
      label: "Registrar ingresos",
      key: "ingresos",
      icon: <LazyIcon name="Actividades" />,
      to: "/almacen/ingresos",
    },
    {
      label: "Registrar salidas",
      key: "salidas",
      icon: <LazyIcon name="Actividades" />,
      to: "/almacen/salidas",
    },
    {
      label: "Activos en áreas",
      key: "areas",
      icon: <LazyIcon name="Ordenes" />,
      children: [
        {
          label: "Gerencia",
          key: "/almacen/areas/gerencia",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/gerencia",
        },
        {
          label: "Administración",
          key: "/almacen/areas/administracion",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/administracion",
        },
        {
          label: "Contabilidad",
          key: "/almacen/areas/contabilidad",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/contabilidad",
        },
        {
          label: "Tesorería",
          key: "/almacen/areas/tesoreria",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/tesoreria",
        },
        {
          label: "Recursos Humanos",
          key: "/almacen/areas/rrhh",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/rrhh",
        },
        {
          label: "Ventas",
          key: "/almacen/areas/ventas",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/ventas",
        },
        {
          label: "Almacén",
          key: "/almacen/areas/almacen",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/almacen",
        },
        {
          label: "Producción",
          key: "/almacen/areas/produccion",
          icon:  <LazyIcon name="Consultas" />,
          to: "/almacen/areas/produccion",
        }


      ],
    },
    {
      label: "Notas",
      key: "notas",
      icon: <LazyIcon name="Activos" />,
      to: "/almacen/notas",
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

