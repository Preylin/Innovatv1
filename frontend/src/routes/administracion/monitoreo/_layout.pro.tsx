import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#components/ui/button";

export const Route = createFileRoute("/administracion/monitoreo/_layout/pro")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full w-full space-y-1">
      <header className="flex items-center justify-between">
        <h1 className=" text-xs md:text-xl font-bold dark:text-mist-50">Registros de servicios Pro</h1>
        <div className="flex items-center gap-2">
          <Button  size="sm" className="mt-2">
            Agregar
          </Button>
          <Button variant="outline" size="sm" className="mt-2">
            Importar
          </Button>
        </div>
      </header>
      <main className="border border-black">
        <p className="mt-4 text-gray-600">Contenido específico para la pestaña Pro.</p>
      </main>
    </div>
  );
}