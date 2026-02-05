import { createLazyFileRoute } from "@tanstack/react-router";
import TablaMostrarRegistrosWather from "../../../modulos/administracion/monitoreo/weather/TablaMostrarRegistrosWeather";

export const Route = createLazyFileRoute("/administracion/monitoreo/weather")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <TablaMostrarRegistrosWather />
    </>
  );
}
