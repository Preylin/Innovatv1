import { createLazyFileRoute } from '@tanstack/react-router'
import { HistorialVentasTable } from '../../../modulos/administracion/historialVentas/TablaMostrarHistorialVentas'

export const Route = createLazyFileRoute('/administracion/historial/ventas')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HistorialVentasTable />
}
