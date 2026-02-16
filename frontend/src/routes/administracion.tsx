import { createFileRoute, redirect } from '@tanstack/react-router'
import MainLayout, { mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import { useMemo } from 'react';
import SpinAtom from '../components/atoms/spin/Spin';
import { UseBarAdministracionIcons } from '../components/atoms/icons/AntDesign/administracion/barAdmIcons';
import { UseComercialesIconsLO } from '../components/atoms/icons/OtrasLibs/Comerciales';
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";


export const Route = createFileRoute('/administracion')({
  beforeLoad: async ({ context }) => {
        const auth = context.auth;
        await auth.ensureReady();
    
        if (!auth.isAuthenticated) {
        throw redirect({ to: "/" });
        }
    },
    pendingComponent: () => (
    <SpinAtom size="large" fullscreen styles={{indicator: {color: '#00d4ff'}}}/>
  ),
    component: RouteComponent,
  })


function RouteComponent() {
  return(
    <MainLayout header={<PanelSuperior title="ADMINISTRACIÓN" MenuItems={useSiderBarContent()} />} />
  )
}

function useSiderBarContent(): AppMenuItem[] {

  return useMemo(() => {
    const nav: NavNodeInterface[] = [
      {
        label: "Inicio",
        key: "/administracion",
        icon: <UseBarAdministracionIcons name="inicio" />,
        to: "/administracion/",
      },
    {
      label: "Actividades administrativas",
      key: "/administracion/actividades",
      icon: <UseBarAdministracionIcons name="actividades" />,
      to: "/administracion/actividades",
    },
    {
      label: "Cotizaciones",
      key: "/administracion/cotizaciones",
      icon: <UseBarAdministracionIcons name="cotizaciones" />,
      children: [
        {
          label: "Crear",
          key: "/administracion/cotizaciones/crear",
          icon:  <UseBarAdministracionIcons name="agregar" />,
          to: "/administracion/cotizaciones/crear",
        },
        {
          label: "Pendientes",
          key: "/administracion/cotizaciones/pendientes",
          icon:  <UseBarAdministracionIcons name="pendiente" />,
          to: "/administracion/cotizaciones/pendientes",
        },
        {
          label: "Hechas",
          key: "/administracion/cotizaciones/hechas",
          icon:  <UseBarAdministracionIcons name="realizado" />,
          to: "/administracion/cotizaciones/hechas",
        },
        {
          label: "Consultas",
          key: "/administracion/cotizaciones/consultas",
          icon:  <UseBarAdministracionIcons name="consultar" />,
          to: "/administracion/cotizaciones/consultas",
        },
      ],
    },
    {
      label: "Ordenes",
      key: "/administracion/ordenes",
      icon: <UseBarAdministracionIcons name="ordenes" />,
      children: [
        {
          label: "Crear",
          key: "/administracion/ordenes/crear",
          icon:  <UseBarAdministracionIcons name="agregar" />,
          to: "/administracion/ordenes/crear",
        },
        {
          label: "Pendientes",
          key: "/administracion/ordenes/pendientes",
          icon:  <UseBarAdministracionIcons name="pendiente" />,
          to: "/administracion/ordenes/pendientes",
        },
        {
          label: "Hechas",
          key: "/administracion/ordenes/hechas",
          icon:  <UseBarAdministracionIcons name="realizado" />,
          to: "/administracion/ordenes/hechas",
        },
        {
          label: "Consultas",
          key: "/administracion/ordenes/consultas",
          icon:  <UseBarAdministracionIcons name="consultar" />,
          to: "/administracion/ordenes/consultas",
        },
      ],
    },
    {
      label: "Productos por adquirir",
      key: "/administracion/productos",
      icon: <UseBarAdministracionIcons name="productAdq" />,
      to: "/administracion/productos",
    },
    {
      label: "Monitoreo",
      key: "/administracion/monitoreo",
      icon: <UseBarAdministracionIcons name="monitoreo" />,
      children: [
        {
          label: "Inicio",
          key: "/administracion/monitoreo/inicio",
          icon:  <UseBarAdministracionIcons name="inicio" />,
          to: "/administracion/monitoreo/inicio",
        },
        {
          label: "Weather",
          key: "/administracion/monitoreo/weather",
          icon:  <UseBarAdministracionIcons name="weather" />,
          to: "/administracion/monitoreo/weather",
        },
        {
          label: "Pro",
          key: "/administracion/monitoreo/pro",
          icon:  <UseBarAdministracionIcons name="pro" />,
          to: "/administracion/monitoreo/pro",
        },
        {
          label: "Chips",
          key: "/administracion/monitoreo/chips",
          icon:  <UseBarAdministracionIcons name="chips" />,
          to: "/administracion/monitoreo/chips",
        },
        {
          label: "Servicios de M/C",
          key: "/administracion/monitoreo/servicios",
          icon:  <UseBarAdministracionIcons name="servicios" />,
          to: "/administracion/monitoreo/servicios",
        },
      ],
    },
    {
      label: "Lista de contactos",
      key: "/administracion/lista",
      icon: <UseBarAdministracionIcons name="contactos" />,
      children: [
        {
          label: "Proveedores",
          key: "/administracion/lista/proveedores",
          icon:  <UseComercialesIconsLO name="proveedor" style={{transform: 'rotateY(180deg)'}} />,
          to: "/administracion/lista/proveedores",
        },
        {
          label: "Clientes",
          key: "/administracion/lista/clientes",
          icon:  <UseComercialesIconsLO name="cliente" />,
          to: "/administracion/lista/clientes",
        },
      ],
    },
    {
      label: "Historial de ventas",
      key: "/administracion/historial",
      icon: <UseBarAdministracionIcons name="historial" />,
      children: [
        {
          label: "Ventas",
          key: "/administracion/historial/ventas",
          icon:  <GiReceiveMoney />,
          to: "/administracion/historial/ventas",
        },
        {
          label: "Compras",
          key: "/administracion/historial/compras",
          icon:  <GiPayMoney />,
          to: "/administracion/historial/compras",
        },
      ],
    },
  ];

  const baseMenu = mapNavToMenu(nav);

  return(
    baseMenu
  )
}, [])
}


