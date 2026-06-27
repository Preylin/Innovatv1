import { createLazyFileRoute } from '@tanstack/react-router'
import ShowClientesLista from '../../../modulos/administracion/lista/clientes/view/panel-principal-clientes';

export const Route = createLazyFileRoute('/administracion/lista/clientes')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <ShowClientesLista />
  )
}
