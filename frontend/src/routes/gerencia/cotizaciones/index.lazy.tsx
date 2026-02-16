import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/gerencia/cotizaciones/')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>
        <Outlet />
    </div>
  )
}
