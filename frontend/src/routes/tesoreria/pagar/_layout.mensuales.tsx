import { createFileRoute } from '@tanstack/react-router'
import { CuentasPorPagarFijas } from '../../../modulos/tesoreria/cuentasPorPagar/components/ModalFormCntPorPagarFijas/PanelCntsPorPagarFijas'

export const Route = createFileRoute('/tesoreria/pagar/_layout/mensuales')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CuentasPorPagarFijas />
}
