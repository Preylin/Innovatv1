import { createLazyFileRoute } from '@tanstack/react-router'
import TabsShowStockRegistrosProduccion from '../../modulos/produccion/stock/TabsShowCatalogosRegistros'

export const Route = createLazyFileRoute('/produccion/stock')({
  component: RouteComponent,
})

function RouteComponent() {
  return < TabsShowStockRegistrosProduccion />
}
