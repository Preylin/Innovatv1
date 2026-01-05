import { createLazyFileRoute } from '@tanstack/react-router'
import CircularMenuContainer from '../components/circularMenu/CircularMenu.container'

export const Route = createLazyFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
      <CircularMenuContainer />
  )
}


