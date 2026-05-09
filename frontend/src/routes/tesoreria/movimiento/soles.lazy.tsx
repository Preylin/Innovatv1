import { createLazyFileRoute } from '@tanstack/react-router'
import TablaBCPSoles from '../../../modulos/tesoreria/efectivo/components/TablaBcpSoles'

export const Route = createLazyFileRoute('/tesoreria/movimiento/soles')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div className='overflow-auto scroll-auto'>
      <TablaBCPSoles />
    </div>
  )
}

