import { createLazyFileRoute } from '@tanstack/react-router'
import TabsShowCatalogosRegistros from '../../modulos/almacen/catalogos/TabsShowCatalogosRegistros'

export const Route = createLazyFileRoute('/almacen/catalogos')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>
      <TabsShowCatalogosRegistros />
    </div>
  )
}
