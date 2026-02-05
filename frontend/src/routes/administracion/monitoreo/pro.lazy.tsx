import { createLazyFileRoute } from "@tanstack/react-router";
import TablaMostrarRegistrosPro from "../../../modulos/administracion/monitoreo/pro/TablaMostrarRegistrosPro";

export const Route = createLazyFileRoute("/administracion/monitoreo/pro")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <TablaMostrarRegistrosPro />
    </>
  );
}
