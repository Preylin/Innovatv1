//src/routes/Gerencia.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout, {
  mapNavToMenu,
  type AppMenuItem,
  type NavNodeInterface,
} from "../components/templates/MainLayout";
import { PanelSuperior } from "../components/interfaz_modulos/TopPanel";
import { useMemo } from "react";
import SpinAtom from "../components/atoms/spin/Spin";
import { UseBarGerenciaIcons } from "../components/atoms/icons/AntDesign/gerencia/BarGerencia";

export const Route = createFileRoute("/gerencia")({
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
});

function RouteComponent() {
  return (
    <MainLayout
      header={<PanelSuperior title="GERENCIA" MenuItems={useSiderBarContent()}/>}
    />
  );
}

function useSiderBarContent(): AppMenuItem[] {

  return useMemo(() => {
    const nav: NavNodeInterface[] = [
      {
        label: "Inicio",
        key: "/gerencia",
        icon: <UseBarGerenciaIcons name="inicio" />,
        to: "/gerencia/",
      },
      {
        label: "Actividades",
        key: "/gerencia/actividades",
        icon: <UseBarGerenciaIcons name="actividades" />,
        children: [
          {
            label: "Programación",
            key: "/gerencia/actividades/programacion",
            icon: <UseBarGerenciaIcons name="programacion" />,
            to: "/gerencia/actividades/programacion",
          },
          {
            label: "Historial",
            key: "/gerencia/actividades/historial",
            icon: <UseBarGerenciaIcons name="historial" />,
            to: "/gerencia/actividades/historial",
          },
        ],
      },
      {
        label: "Cotizaciones",
        key: "/gerencia/cotizaciones",
        icon: <UseBarGerenciaIcons name="cotizaciones" />,
        children: [
          {
            label: "Crear",
            key: "/gerencia/cotizaciones/crear",
            icon: <UseBarGerenciaIcons name="agregar" />,
            to: "/gerencia/cotizaciones/crear",
          },
          {
            label: "Pendientes",
            key: "/gerencia/cotizaciones/pendientes",
            icon: <UseBarGerenciaIcons name="pendiente" />,
            to: "/gerencia/cotizaciones/pendientes",
          },
          {
            label: "Hechas",
            key: "/gerencia/cotizaciones/hechas",
            icon: <UseBarGerenciaIcons name="realizado" />,
            to: "/gerencia/cotizaciones/hechas",
          },
          {
            label: "Consultas",
            key: "/gerencia/cotizaciones/consultas",
            icon: <UseBarGerenciaIcons name="consultar" />,
            to: "/gerencia/cotizaciones/consultas",
          },
        ],
      },
      {
        label: "Ordenes",
        key: "/gerencia/ordenes",
        icon: <UseBarGerenciaIcons name="ordenes" />,
        children: [
          {
            label: "Crear",
            key: "/gerencia/ordenes/crear",
            icon: <UseBarGerenciaIcons name="agregar" />,
            to: "/gerencia/ordenes/crear",
          },
          {
            label: "Pendientes",
            key: "/gerencia/ordenes/pendientes",
            icon: <UseBarGerenciaIcons name="pendiente" />,
            to: "/gerencia/ordenes/pendientes",
          },
          {
            label: "Hechas",
            key: "/gerencia/ordenes/hechas",
            icon: <UseBarGerenciaIcons name="realizado" />,
            to: "/gerencia/ordenes/hechas",
          },
          {
            label: "Consultas",
            key: "/gerencia/ordenes/consultas",
            icon: <UseBarGerenciaIcons name="consultar" />,
            to: "/gerencia/ordenes/consultas",
          },
        ],
      },
      {
        label: "Usuarios",
        key: "/gerencia/usuarios",
        icon: <UseBarGerenciaIcons name="usuarios" />,
        to: "/gerencia/usuarios",
      },
    ];

    const baseMenu = mapNavToMenu(nav);

    return (
      baseMenu
    );
  }, []);
}
