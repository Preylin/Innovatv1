import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/gerencia/cotizaciones')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='h-180 w-300 border border-black'>
    <div> cotizaciones</div>
    </div>
}
