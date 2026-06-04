import { createFileRoute } from "@tanstack/react-router";
import MainLayout, {
  mapNavToMenu,
  type AppMenuItem,
  type NavNodeInterface,
} from "../components/templates/MainLayout";
import { PanelSuperior } from "../components/interfaz_modulos/TopPanel";
import { useMemo } from "react";
import { UseBarTesoreriaIcons } from "../components/atoms/icons/AntDesign/tesoreria/BarTesoreria";
import { UseSpinnersIcons } from "../components/atoms/icons/OtrasLibs/Spinners";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export const Route = createFileRoute("/produccion")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Producción");

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
