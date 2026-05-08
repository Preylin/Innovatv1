import { createLazyFileRoute } from '@tanstack/react-router'
import TableCajaChica from '../../../modulos/tesoreria/efectivo/components/TableCajaChica'

export const Route = createLazyFileRoute('/tesoreria/movimiento/caja')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div className='overflow-auto scroll-auto'>
      <TableCajaChica />
    </div>
  )
}
