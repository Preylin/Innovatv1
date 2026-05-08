import { createLazyFileRoute } from '@tanstack/react-router'
import PanelCntsPorCobrar from '../../modulos/tesoreria/cuentasPorPagar/components/PanelCntsPorPagar'

export const Route = createLazyFileRoute('/tesoreria/pagar')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
        <PanelCntsPorCobrar />
    </div>
  )
}