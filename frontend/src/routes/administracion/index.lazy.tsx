import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/administracion/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
