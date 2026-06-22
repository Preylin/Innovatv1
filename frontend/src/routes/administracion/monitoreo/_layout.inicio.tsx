import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/administracion/monitoreo/_layout/inicio",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-2">
      <section className=" h-[calc(100vh-95px)] grid grid-cols-1 md:grid-cols-2 gap-2 overflow-auto scroll-auto w-full p-1">
        <Card size="sm" className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Innova-t Weather</CardTitle>
            <CardDescription>Registros de servicios pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center gap-2">
              <div className=" border border-red-500 rounded-4xl">5</div>
              <span className="text-sm text-gray-500">Servicio Weather</span>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Innova-t Pro</CardTitle>
            <CardDescription>Registros de servicios pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center gap-2">
              <div className=" border border-red-500 rounded-4xl">5</div>
              <span className="text-sm text-gray-500">Servicio Pro</span>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Innova-t Chips</CardTitle>
            <CardDescription>Registros de servicios pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center gap-2">
              <div className=" border border-red-500 rounded-4xl">5</div>
              <span className="text-sm text-gray-500 ">Servicio Chips</span>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Innova-t Mantenimiento</CardTitle>
            <CardDescription>Registros de servicios pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center gap-2">
              <div className=" border border-red-500 rounded-4xl">5</div>
              <span className="text-sm text-gray-500">
                Servicio Mantenimiento
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className=" h-[calc(100vh-55px)] ">
        <section>busqueda</section>
        <section>filtros de fechas y filtros de tipo de servicios</section>
        <section>tabla de registros</section>
      </section>
    </div>
  );
}
