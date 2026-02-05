import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import TabsShowStatusRegistros from "../../modulos/almacen/inicio/TabsShowCatalogosRegistros";
import { Typography } from "antd";
const { Title } = Typography;

export const Route = createLazyFileRoute("/almacen/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Title style={{ marginBottom: '1px'}} level={3}>Monitoreo de productos en STOCK</Title>
      <TabsShowStatusRegistros />
      <Outlet />
    </div>
  );
}



