import { createLazyFileRoute } from "@tanstack/react-router";
import TabsShowIngresosMercaderias from "../../modulos/almacen/ingresos/TabsMostrarIngresosMercaderia";

export const Route = createLazyFileRoute("/almacen/ingresos")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
      <TabsShowIngresosMercaderias />
  );
}
