import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/administracion/monitoreo/')({
    component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
