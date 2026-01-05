import { createFileRoute, redirect } from '@tanstack/react-router'
import { LazyIcon } from '../components/atoms/icons/IconsSiderBar';
import MainLayout, { buildModulos, getItem, mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { useAuthState } from '../api/auth';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import {SlackOutlined,} from "@ant-design/icons";


export const Route = createFileRoute('/administracion')({
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
    <MainLayout header={<PanelSuperior title="ADMINISTRACIÓN" />} modulos={useSiderBarContent()} />
  )
}


function useSiderBarContent(): AppMenuItem[] {
  const { user } = useAuthState();

  const nav: NavNodeInterface[] = [
    {
      label: "Actividades administrativas",
      key: "actividades",
      icon: <LazyIcon name="Actividades" />,
      to: "/administracion/actividades",
    },
    {
      label: "Cotizaciones",
      key: "cotizaciones",
      icon: <LazyIcon name="Cotizaciones" />,
      children: [
        {
          label: "Crear",
          key: "/administracion/cotizaciones/crear",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/administracion/cotizaciones/crear",
        },
        {
          label: "Pendientes",
          key: "/administracion/cotizaciones/pendientes",
          icon:  <LazyIcon name="Pendientes" />,
          to: "/administracion/cotizaciones/pendientes",
        },
        {
          label: "Hechas",
          key: "/administracion/cotizaciones/hechas",
          icon:  <LazyIcon name="Hechas" />,
          to: "/administracion/cotizaciones/hechas",
        },
        {
          label: "Consultas",
          key: "/administracion/cotizaciones/consultas",
          icon:  <LazyIcon name="Consultas" />,
          to: "/administracion/cotizaciones/consultas",
        },
      ],
    },
    {
      label: "Ordenes",
      key: "ordenes",
      icon: <LazyIcon name="Ordenes" />,
      children: [
        {
          label: "Crear",
          key: "/administracion/ordenes/crear",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/administracion/ordenes/crear",
        },
        {
          label: "Pendientes",
          key: "/administracion/ordenes/pendientes",
          icon:  <LazyIcon name="Pendientes" />,
          to: "/administracion/ordenes/pendientes",
        },
        {
          label: "Hechas",
          key: "/administracion/ordenes/hechas",
          icon:  <LazyIcon name="Hechas" />,
          to: "/administracion/ordenes/hechas",
        },
        {
          label: "Consultas",
          key: "/administracion/ordenes/consultas",
          icon:  <LazyIcon name="Consultas" />,
          to: "/administracion/ordenes/consultas",
        },
      ],
    },
    {
      label: "Productos por adquirir",
      key: "productos",
      icon: <LazyIcon name="Actividades" />,
      to: "/administracion/productos",
    },
    {
      label: "Monitoreo",
      key: "monitoreo",
      icon: <LazyIcon name="Ordenes" />,
      children: [
        {
          label: "Inicio",
          key: "/administracion/monitoreo/inicio",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/administracion/monitoreo/inicio",
        },
        {
          label: "Weather",
          key: "/administracion/monitoreo/weather",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/administracion/monitoreo/weather",
        },
        {
          label: "Pro",
          key: "/administracion/monitoreo/pro",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/administracion/monitoreo/pro",
        },
        {
          label: "Chips",
          key: "/administracion/monitoreo/chips",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/administracion/monitoreo/chips",
        },
        {
          label: "Servicios de M/C",
          key: "/administracion/monitoreo/servicios",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/administracion/monitoreo/servicios",
        },
      ],
    },
    {
      label: "Lista de contactos",
      key: "lista",
      icon: <LazyIcon name="Ordenes" />,
      children: [
        {
          label: "Proveedores",
          key: "/administracion/lista/proveedores",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/administracion/lista/proveedores",
        },
        {
          label: "Clientes",
          key: "/administracion/lista/clientes",
          icon:  <LazyIcon name="Ordenes" />,
          to: "/administracion/lista/clientes",
        },
      ],
    },
    {
      label: "Historial de ventas",
      key: "ventas",
      icon: <LazyIcon name="Activos" />,
      to: "/administracion/ventas",
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


