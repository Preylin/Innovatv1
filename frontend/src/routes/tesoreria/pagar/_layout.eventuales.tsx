import { createFileRoute } from '@tanstack/react-router'
import CuentasPorPagarEventuales from '../../../modulos/tesoreria/cuentasPorPagar/components/CntsPorPagarEventuales/PanelCntsPorPagarEventuales'

export const Route = createFileRoute('/tesoreria/pagar/_layout/eventuales')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CuentasPorPagarEventuales />
}
