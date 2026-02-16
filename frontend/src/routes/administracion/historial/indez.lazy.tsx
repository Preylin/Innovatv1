import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/administracion/historial/indez')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
