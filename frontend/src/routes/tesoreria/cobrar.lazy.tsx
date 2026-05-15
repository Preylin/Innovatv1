import { createLazyFileRoute } from '@tanstack/react-router'
import TablaMostarCntPorPagar from '../../modulos/tesoreria/cuentasPorCobrar/components/TablaMostrarCntPorCobrar'

export const Route = createLazyFileRoute('/tesoreria/cobrar')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>
        <TablaMostarCntPorPagar />
    </div>
  )
}
