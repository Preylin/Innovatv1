import { createLazyFileRoute } from "@tanstack/react-router";
import ShowClientesLista from "../../../modulos/administracion/lista/clientes/view/panel-principal-clientes";
import ShowProveedoresLista from "../../../modulos/administracion/lista/proveedores/view/panel-principal-proveedores";

export const Route = createLazyFileRoute("/administracion/lista/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-2 space-y-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
      <section className="w-full overflow-auto scroll-auto h-dvh lg:h-[calc(100vh-65px)]">
        <ShowClientesLista />
      </section>
      <section className="w-full overflow-auto scroll-auto h-dvh lg:h-[calc(100vh-65px)]">
        <ShowProveedoresLista />
      </section>
    </div>
  );
}
