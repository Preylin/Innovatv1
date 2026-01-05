import { Outlet, createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/gerencia/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}