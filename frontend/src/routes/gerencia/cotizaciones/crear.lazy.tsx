import { createLazyFileRoute } from "@tanstack/react-router";
import ExampleKit from "../../../components/tree/mainCom";

export const Route = createLazyFileRoute("/gerencia/cotizaciones/crear")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      < ExampleKit />
    </div>
  );
}
