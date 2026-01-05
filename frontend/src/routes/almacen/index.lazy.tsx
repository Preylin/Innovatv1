import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/almacen/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
