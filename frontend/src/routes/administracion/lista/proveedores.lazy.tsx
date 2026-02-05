import { createLazyFileRoute } from '@tanstack/react-router'
import MostrarProveedoresList from '../../../modulos/administracion/lista/proveedores/MostrarRegistrosClientesProv'

export const Route = createLazyFileRoute('/administracion/lista/proveedores')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <MostrarProveedoresList />
  )
}
