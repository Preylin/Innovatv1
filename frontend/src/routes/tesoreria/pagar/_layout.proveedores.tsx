import { createFileRoute } from '@tanstack/react-router'
import CuentasPorPagarProveedores from '../../../modulos/tesoreria/cuentasPorPagar/components/CntsPorPagarProveedores/PanelCntsPorPagarProveedores'

export const Route = createFileRoute('/tesoreria/pagar/_layout/proveedores')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CuentasPorPagarProveedores />
}
