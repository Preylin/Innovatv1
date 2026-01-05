import { createLazyFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/tesoreria/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
