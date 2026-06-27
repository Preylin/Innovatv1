import { createFileRoute } from "@tanstack/react-router";
import { ShowChips } from "../../../modulos/administracion/monitoreo/chips/view/panel-principal-chips";

export const Route = createFileRoute("/administracion/monitoreo/_layout/chips")({
  beforeLoad: () => {
    return {
      meta: { title: 'Monitoreo - Chips' },
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <ShowChips />
  );
}
