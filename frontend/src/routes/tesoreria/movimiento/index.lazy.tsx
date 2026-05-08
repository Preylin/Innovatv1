import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/tesoreria/movimiento/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tesoreria/movimiento/"!</div>
}
