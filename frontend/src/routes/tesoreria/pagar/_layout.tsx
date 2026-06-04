import { createFileRoute } from '@tanstack/react-router'
import PanelCntsPorPagar from '../../../modulos/tesoreria/cuentasPorPagar/components/PanelCntsPorPagar'

export const Route = createFileRoute('/tesoreria/pagar/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PanelCntsPorPagar />
}
