import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import {
  PanelCarucelProductosTerminarStock,
} from "../../modulos/almacen/inicio/Paneles/Carrucel/TabsShowCatalogosRegistros";
import { PanelTotalesSolesDolares } from "../../modulos/almacen/inicio/Paneles/Totales/PanelTotalesMercaderiaMateriales";
import { PanelBusquedaProductos } from "../../modulos/almacen/inicio/Paneles/Busqueda/PanelBusquedaProductos";


export const Route = createLazyFileRoute("/almacen/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-6 p-1 overflow-auto scroll-auto" style={{ height: "calc(100vh - 48px)" }}>
      <PanelTotalesSolesDolares />
      <PanelBusquedaProductos />
      <PanelCarucelProductosTerminarStock />
      <Outlet />
    </div>
  );
}
