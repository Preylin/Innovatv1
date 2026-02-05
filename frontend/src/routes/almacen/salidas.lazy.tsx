import { createLazyFileRoute } from "@tanstack/react-router";
import TabsShowSalidasMercaderias from "../../modulos/almacen/salidas/TabsMostrarIngresosMercaderia";

export const Route = createLazyFileRoute("/almacen/salidas")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <TabsShowSalidasMercaderias />
    </>
  );
}

