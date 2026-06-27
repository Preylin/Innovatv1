import { createFileRoute } from "@tanstack/react-router";
import { ShowPro } from "../../../modulos/administracion/monitoreo/pro/view/panel-principal-pro";

export const Route = createFileRoute("/administracion/monitoreo/_layout/pro")({
  beforeLoad: () => {
    return {
      meta: { title: 'Monitoreo - Pro' },
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ShowPro />
  );
}