import { createLazyFileRoute } from "@tanstack/react-router";
import TablaMostrarRegistrosChipServicio from "../../../modulos/administracion/monitoreo/chips/servicio/TablaMostrarRegistroChipServicios";

export const Route = createLazyFileRoute("/administracion/monitoreo/chips")({
  component: RouteComponent,
});

function RouteComponent() {

  return (
      <TablaMostrarRegistrosChipServicio />
  );
}
