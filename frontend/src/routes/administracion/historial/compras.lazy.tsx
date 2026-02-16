import { createLazyFileRoute } from '@tanstack/react-router'
import { HistorialComprasTable } from '../../../modulos/administracion/historialVentas/TablaMostrarHistorialCompras'

export const Route = createLazyFileRoute('/administracion/historial/compras')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HistorialComprasTable />
}
