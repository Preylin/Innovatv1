import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/administracion/lista/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
