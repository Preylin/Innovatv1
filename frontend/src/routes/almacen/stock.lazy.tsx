import { createLazyFileRoute } from '@tanstack/react-router'
import TabsShowStockRegistros from '../../modulos/almacen/stock/TabsShowCatalogosRegistros'

export const Route = createLazyFileRoute('/almacen/stock')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <TabsShowStockRegistros />
  )
}
