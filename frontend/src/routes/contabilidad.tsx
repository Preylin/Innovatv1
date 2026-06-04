import { createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout, { mapNavToMenu, type AppMenuItem, type NavNodeInterface } from "../components/templates/MainLayout";
import { PanelSuperior } from "../components/interfaz_modulos/TopPanel";
import { useMemo } from "react";
import { UseBarGerenciaIcons } from "../components/atoms/icons/AntDesign/gerencia/BarGerencia";
import { useDocumentTitle } from "../hooks/useDocumentTitle";



export const Route = createFileRoute("/contabilidad")({
  beforeLoad: async ({ context }) => {
    const auth = context.auth;
    await auth.ensureReady();

    if (!auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});


function RouteComponent() {
  useDocumentTitle("Contabilidad");

  return (
    <MainLayout
      header={<PanelSuperior title="CONTABILIDAD" MenuItems={useSiderBarContent()}/>}
    />
  );
}

function useSiderBarContent(): AppMenuItem[] {

  return useMemo(() => {
    const nav: NavNodeInterface[] = [
      {
        label: "Inicio",
        key: "/contabilidad",
        icon: <UseBarGerenciaIcons name="inicio" />,
        to: "/contabilidad/",
      },
      {
        label: "Ventas",
        key: "/contabilidad/ventas",
        icon: <UseBarGerenciaIcons name="inicio" />,
        to: "/contabilidad/ventas",
      },
      {
        label: "Compras",
        key: "/contabilidad/compras",
        icon: <UseBarGerenciaIcons name="inicio" />,
        to: "/contabilidad/compras",
      },

    ];

    const baseMenu = mapNavToMenu(nav);

    return (
      baseMenu
    );
  }, []);
}
