import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/gerencia/cotizaciones/crear")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      desarrollo
    </div>
  );
}
