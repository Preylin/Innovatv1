import { createLazyFileRoute } from '@tanstack/react-router'
import TablaMostrarCntPorCobrar from '../../modulos/tesoreria/cuentasPorCobrar/components/TablaMostrarCntPorCobrar'

export const Route = createLazyFileRoute('/tesoreria/cobrar')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>
        <TablaMostrarCntPorCobrar />
    </div>
  )
}
