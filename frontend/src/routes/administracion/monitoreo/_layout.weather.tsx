import { createFileRoute } from "@tanstack/react-router";
import { ShowWeather } from "../../../modulos/administracion/monitoreo/weather/view/panel-principal-weather";

export const Route = createFileRoute("/administracion/monitoreo/_layout/weather")({
  beforeLoad: () => {
    return {
      meta: { title: 'Monitoreo - Weather' },
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <ShowWeather />
  );
}
