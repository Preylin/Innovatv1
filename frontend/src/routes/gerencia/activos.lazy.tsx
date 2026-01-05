import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/gerencia/activos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/gerencia/activos"!</div>
}
