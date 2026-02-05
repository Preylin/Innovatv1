import { createFileRoute, redirect } from '@tanstack/react-router'
import MainLayout, { mapNavToMenu, type AppMenuItem, type NavNodeInterface } from '../components/templates/MainLayout';
import { PanelSuperior } from '../components/interfaz_modulos/TopPanel';
import SpinAtom from '../components/atoms/spin/Spin';
import { useMemo } from 'react';
import { UseBarTesoreriaIcons } from '../components/atoms/icons/AntDesign/tesoreria/BarTesoreria';
import { UseComercialesIconsLO } from '../components/atoms/icons/OtrasLibs/Comerciales';

export const Route = createFileRoute('/tesoreria')({
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
    <MainLayout header={<PanelSuperior title="TESORERÍA" MenuItems={useSiderBarContent()} />} />
  )
}


function useSiderBarContent(): AppMenuItem[] {

  return useMemo(() => {
    const nav: NavNodeInterface[] = [
      {
        label: "Inicio",
        key: "/tesoreria",
        icon: <UseBarTesoreriaIcons name="inicio" />,
        to: "/tesoreria/",
      },
    {
      label: "Cuentas de efectivo",
      key: "/tesoreria/movimiento",
      icon: <UseBarTesoreriaIcons name="cnt_efectivo" />,
      children: [
        {
          label: "Caja Chica",
          key: "/tesoreria/movimiento/caja",
          icon:  <UseComercialesIconsLO name="cajaChica" />,
          to: "/tesoreria/movimiento/caja",
        },
        {
          label: "BCP soles",
          key: "/tesoreria/movimiento/soles",
          icon:  <UseComercialesIconsLO name="soles" />,
          to: "/tesoreria/movimiento/soles",
        },
        {
          label: "BCP dólares",
          key: "/tesoreria/movimiento/dolares",
          icon:  <UseComercialesIconsLO name="dolar" />,
          to: "/tesoreria/movimiento/dolares",
        },

      ],
    },
    
    {
      label: "Cuentas por cobrar",
      key: "/tesoreria/cobrar",
      icon: <UseComercialesIconsLO name="cntCobrar" />,
      to: "/tesoreria/cobrar",
    },
    {
      label: "Cuentas por pagar",
      key: "/tesoreria/pagar",
      icon: <UseComercialesIconsLO name="cntPagar" />,
      to: "/tesoreria/pagar",
    },
  ];

  const baseMenu = mapNavToMenu(nav);

  return(
    baseMenu
  )

}, [])
}
