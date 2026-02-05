import { createLazyFileRoute } from "@tanstack/react-router";
import UsuarioTable from "../../modulos/gerencia/usuarios/TablaMostrarUsuariosController";
import useWindowSize from "../../hooks/WindowSize";

export const Route = createLazyFileRoute("/gerencia/usuarios")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="">
          <UsuarioTable />
          <ExampleModal />
    </div>
  );
}


function ExampleModal() {
  const windowSize = useWindowSize()
  return (
    <div>
      {windowSize.width} x {windowSize.height}
    </div>
    );
}