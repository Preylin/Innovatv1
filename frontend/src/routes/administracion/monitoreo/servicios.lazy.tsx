import { createLazyFileRoute } from '@tanstack/react-router'
import TablaMostrarRegistrosMc from '../../../modulos/administracion/monitoreo/serviciosMC/TablaMostrarRegistrosServiciosMC'

export const Route = createLazyFileRoute('/administracion/monitoreo/servicios')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return (
  <>
  <TablaMostrarRegistrosMc />
  </>
)
}
