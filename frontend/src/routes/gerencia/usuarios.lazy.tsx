import { createLazyFileRoute } from "@tanstack/react-router";
import UsuarioTable from "../../modulos/gerencia/usuarios/TablaMostrarUsuariosController";

export const Route = createLazyFileRoute("/gerencia/usuarios")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="">
          <UsuarioTable />
    </div>
  );
}
