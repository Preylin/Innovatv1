import { createLazyFileRoute } from "@tanstack/react-router";
import CardAtom from "../../components/atoms/card/Card";
import UsuarioTable from "../../components/atoms/table/Tabla_panel_control";


export const Route = createLazyFileRoute("/gerencia/actividades")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-wrap gap-3 bg-amber-200">

      <CardAtom title={"Usuarios"} extra={"Ver más"} variant="borderless">
        <div className="w-300 overflow-hidden">
          <UsuarioTable />
        </div>
      </CardAtom>

      {/* <ExampleModal /> */}
    </div>
  );
}

