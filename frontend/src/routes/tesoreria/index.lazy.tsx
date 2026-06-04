import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import ResumenSaldoEfectivo from "../../modulos/tesoreria/efectivo/components/PanelResumenSaldos";
import PanelResumenPorCobrar from "../../modulos/tesoreria/components/PanelResumenPorPagar";
import { PanelMostrarDerehosObligacionesFilter } from "../../modulos/tesoreria/components/PanelMostrarDerechosObligacionesFilter";

export const Route = createLazyFileRoute("/tesoreria/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <ResumenSaldoEfectivo />
      <PanelResumenPorCobrar />
      <PanelMostrarDerehosObligacionesFilter />
      <Outlet />
    </div>
  );
}
