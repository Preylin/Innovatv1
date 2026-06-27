import { createFileRoute } from '@tanstack/react-router'
import { ShowMC } from '../../../modulos/administracion/monitoreo/serviciosMC/view/panel-principal-mc';

export const Route = createFileRoute('/administracion/monitoreo/_layout/servicios')(
  
  {
    beforeLoad: () => {
      return {
        meta: { title: 'Monitoreo - M-C' },
      }
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  
  return (
    <ShowMC />
  );
}