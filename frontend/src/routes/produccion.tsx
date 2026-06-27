import { createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout, {
  mapNavToMenu,
  type AppMenuItem,
  type NavNodeInterface,
} from "../components/templates/MainLayout";
import { PanelSuperior } from "../components/interfaz_modulos/TopPanel";
import { useMemo } from "react";
import { UseBarTesoreriaIcons } from "../components/atoms/icons/AntDesign/tesoreria/BarTesoreria";
import { UseSpinnersIcons } from "../components/atoms/icons/OtrasLibs/Spinners";
import SpinAtom from "#components/atoms/spin/Spin";

export const Route = createFileRoute("/produccion")({
  beforeLoad: async ({ context }) => {
      const auth = context.auth;
      await auth.ensureReady();
  
      if (!auth.isAuthenticated) {
        throw redirect({ to: "/" });
      }
  
      return {
        meta: {
          title: "Producción",
        },
      };
    },
    pendingComponent: () => (
      <SpinAtom size="large" fullscreen styles={{indicator: {color: '#00d4ff'}}}/>
    ),
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <MainLayout
      header={
        <PanelSuperior title="PRODUCCIÓN" MenuItems={useSiderBarContent()} />
      }
    />
  );
}

function useSiderBarContent(): AppMenuItem[] {
  return useMemo(() => {
    const nav: NavNodeInterface[] = [
      {
        label: "Inicio",
        key: "/produccion",
        icon: <UseBarTesoreriaIcons name="inicio" />,
        to: "/produccion/",
      },
      {
        label: "Stock",
        key: "/produccion/stock",
        icon: <UseSpinnersIcons name="stock" />,
        to: "/produccion/stock",
      },
    ];

    const baseMenu = mapNavToMenu(nav);

    return baseMenu;
  }, []);
}
