import { createLazyFileRoute, Outlet } from '@tanstack/react-router'


export const Route = createLazyFileRoute('/contabilidad/')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
      <div>Panel de Contabilidad</div>
      <Outlet />
    </div>
  )
}



