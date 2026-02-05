import { createFileRoute, redirect } from '@tanstack/react-router'
import MainLayout, { mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import SpinAtom from '../components/atoms/spin/Spin';
import { useMemo } from 'react';
import { UseBarAlmacenIcons } from '../components/atoms/icons/AntDesign/almacen/barAlmacen';
import { UseSpinnersIcons } from '../components/atoms/icons/OtrasLibs/Spinners';
import { UseComercialesIconsLO } from '../components/atoms/icons/OtrasLibs/Comerciales';

export const Route = createFileRoute('/almacen')({
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
    <MainLayout header={<PanelSuperior title="ALMACÉN" MenuItems={useSiderBarContent()} />} />
  )
}

function useSiderBarContent(): AppMenuItem[] {

  return useMemo(() => {
    const nav: NavNodeInterface[] = [
    {
      label: "Inicio",
      key: "/almacen",
      icon: <UseBarAlmacenIcons name="inicio" />,
      to: "/almacen/",
    },
    {
      label: "Stock",
      key: "/almacen/stock",
      icon: <UseSpinnersIcons name="stock" />,
      to: "/almacen/stock",
    },
    {
      label: "Registrar ingreso",
      key: "/almacen/ingresos",
      icon: <UseComercialesIconsLO name="proveedor" style={{transform: 'rotateY(180deg)'}} />,
      to: "/almacen/ingresos",
    },
    {
      label: "Registrar salida",
      key: "/almacen/salidas",
      icon: <UseComercialesIconsLO name="salida" />,
      to: "/almacen/salidas",
    },
    {
      label: "Activos en áreas",
      key: "/almacen/areas",
      icon: <UseBarAlmacenIcons name="activosAreas" />,
      children: [
        {
          label: "Gerencia",
          key: "/almacen/areas/gerencia",
          to: "/almacen/areas/gerencia",
        },
        {
          label: "Administración",
          key: "/almacen/areas/administracion",
          to: "/almacen/areas/administracion",
        },
        {
          label: "Contabilidad",
          key: "/almacen/areas/contabilidad",
          to: "/almacen/areas/contabilidad",
        },
        {
          label: "Tesorería",
          key: "/almacen/areas/tesoreria",
          to: "/almacen/areas/tesoreria",
        },
        {
          label: "Recursos Humanos",
          key: "/almacen/areas/rrhh",
          to: "/almacen/areas/rrhh",
        },
        {
          label: "Ventas",
          key: "/almacen/areas/ventas",
          to: "/almacen/areas/ventas",
        },
        {
          label: "Almacén",
          key: "/almacen/areas/almacen",
          to: "/almacen/areas/almacen",
        },
        {
          label: "Producción",
          key: "/almacen/areas/produccion",
          to: "/almacen/areas/produccion",
        }
      ],
    },
    {
      label: "Catálogos",
      key: "/almacen/catalogos",
      icon: <UseComercialesIconsLO name="catalogo" />,
      to: "/almacen/catalogos",
    },
    {
      label: "Notas",
      key: "/almacen/notas",
      icon: <UseBarAlmacenIcons name="notas" />,
      to: "/almacen/notas",
    },
  ];

  const baseMenu = mapNavToMenu(nav);

  return(
    baseMenu
  )

}, [])
}

