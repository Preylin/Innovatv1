import { createFileRoute } from "@tanstack/react-router";
import PanelPrincipalMonitoreoInicio from "../../../modulos/administracion/monitoreo/inicio/view/panel-principal-monitoreo-inicio";
export const Route = createFileRoute(
  "/administracion/monitoreo/_layout/inicio",
)({
  beforeLoad: () => {
    return {
      meta: { title: 'Monitoreo - Inicio' },
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <PanelPrincipalMonitoreoInicio />
  )
}