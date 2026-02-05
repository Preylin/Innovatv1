import { createLazyFileRoute } from '@tanstack/react-router'
import MostrarClientesList from '../../../modulos/administracion/lista/clientes/MostrarRegistrosClientes';

export const Route = createLazyFileRoute('/administracion/lista/clientes')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <MostrarClientesList />
  )
}
