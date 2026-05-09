import { createLazyFileRoute } from '@tanstack/react-router'
import TablaBcpDolares from '../../../modulos/tesoreria/efectivo/components/TablaBcpDolares'

export const Route = createLazyFileRoute('/tesoreria/movimiento/dolares')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
        <TablaBcpDolares />
    </div>
  )
}
