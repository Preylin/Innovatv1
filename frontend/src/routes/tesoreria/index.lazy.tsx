import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import ResumenSaldoEfectivo from "../../modulos/tesoreria/efectivo/components/PanelResumenSaldos";
import PanelResumenPorCobrar from "../../modulos/tesoreria/cuentasPorCobrar/components/PanelResumenPorPagar";

export const Route = createLazyFileRoute("/tesoreria/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <ResumenSaldoEfectivo />
      <PanelResumenPorCobrar />
      <Outlet />
    </div>
  );
}
