//src/routes/Gerencia.tsx
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import {
  SlackOutlined,
} from "@ant-design/icons";
import { useAuthState } from "../api/auth";
import MainLayout, {
  buildModulos,
  getItem,
  mapNavToMenu,
  type AppMenuItem,
  type NavNodeInterface,
} from "../components/templates/MainLayout";
import { LazyIcon } from "../components/atoms/icons/IconsSiderBar";
import { PanelSuperior } from "../components/interfaz_modulos/TopPanel";

const canon = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const Route = createFileRoute("/gerencia")({
  beforeLoad: async ({ context }) => {
    const auth = context.auth;
    await auth.ensureReady();

    if (!auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
    const tienePermiso = auth.user?.permisos?.some(
      (p) => canon(p.name_module) === canon("gerencia")
    );

    if (!tienePermiso) {
      console.warn("Acceso denegado a Gerencia");
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});


function RouteComponent() {
  return(
    <MainLayout header={<PanelSuperior title="GERENCIA" />} modulos={useSiderBarContent()} />
  )
}


function useSiderBarContent(): AppMenuItem[] {
  const { user } = useAuthState();

  const nav: NavNodeInterface[] = [
    {
      label: "Actividades",
      key: "actividades",
      icon: <LazyIcon name="Actividades" />,
      children: [
        {
          label: "Programación",
          key: "/gerencia/actividades/programacion",
          icon:  <LazyIcon name="Programacion" />,
          to: "/gerencia/actividades/programacion",
        },
        {
          label: "Historial",
          key: "/gerencia/actividades/historial",
          icon:  <LazyIcon name="Historial" />,
          to: "/gerencia/actividades/historial",
        },
      ],
    },
    {
      label: "Cotizaciones",
      key: "cotizaciones",
      icon: <LazyIcon name="Cotizaciones" />,
      children: [
        {
          label: "Crear",
          key: "/gerencia/cotizaciones/crear",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/gerencia/cotizaciones/crear",
        },
        {
          label: "Pendientes",
          key: "/gerencia/cotizaciones/pendientes",
          icon:  <LazyIcon name="Pendientes" />,
          to: "/gerencia/cotizaciones/pendientes",
        },
        {
          label: "Hechas",
          key: "/gerencia/cotizaciones/hechas",
          icon:  <LazyIcon name="Hechas" />,
          to: "/gerencia/cotizaciones/hechas",
        },
        {
          label: "Consultas",
          key: "/gerencia/cotizaciones/consultas",
          icon:  <LazyIcon name="Consultas" />,
          to: "/gerencia/cotizaciones/consultas",
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
          key: "/gerencia/ordenes/crear",
          icon:  <LazyIcon name="Adicionar" />,
          to: "/gerencia/ordenes/crear",
        },
        {
          label: "Pendientes",
          key: "/gerencia/ordenes/pendientes",
          icon:  <LazyIcon name="Pendientes" />,
          to: "/gerencia/ordenes/pendientes",
        },
        {
          label: "Hechas",
          key: "/gerencia/ordenes/hechas",
          icon:  <LazyIcon name="Hechas" />,
          to: "/gerencia/ordenes/hechas",
        },
        {
          label: "Consultas",
          key: "/gerencia/ordenes/consultas",
          icon:  <LazyIcon name="Consultas" />,
          to: "/gerencia/ordenes/consultas",
        },
      ],
    },
    {
      label: "Usuarios",
      key: "/gerencia/usuarios",
      icon: <LazyIcon name="Usuarios" />,
      to: "/gerencia/usuarios",
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
