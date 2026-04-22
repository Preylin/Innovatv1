import { createLazyFileRoute } from "@tanstack/react-router";
import TablaActivosPersonal from "../../modulos/administracion/activos/components/activosPersonal";
import TablaActivosMoviles from "../../modulos/administracion/activos/components/activosMoviles";
import TablaActivosDispositivos from "../../modulos/administracion/activos/components/activosDispositivos";

export const Route = createLazyFileRoute("/administracion/activos")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-3">
      <TablaActivosPersonal />
      <TablaActivosMoviles />
      <TablaActivosDispositivos />
    </div>
  );
}
