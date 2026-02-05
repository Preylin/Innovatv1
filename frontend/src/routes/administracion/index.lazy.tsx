import { createLazyFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Card, Col, Row, Typography } from "antd";
import { GiSpinningBlades } from "react-icons/gi";
const { Title, Text } = Typography;

export const Route = createLazyFileRoute("/administracion/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-1">
      <PanelGeneralAdministracion />
      <Outlet />
    </div>
  );
}

function PanelGeneralAdministracion() {
  return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="shadow-sm">
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={8}>
                <Title level={2}>Panel general en desarrollo</Title>
                <Text type="secondary" className="text-lg">
                  Por el momento puede ir a:
                </Text>
              </Col>

              <Col xs={24} lg={16}>
                <Row gutter={[12, 12]}>
                  {[
                    {
                      to: "/administracion/monitoreo/inicio",
                      label: "Monitoreo de servicios Weather, Pro, Chips y M/C",
                    },
                    {
                      to: "/administracion/lista/clientes",
                      label: "Lista de clientes",
                    },
                    {
                      to: "/administracion/lista/proveedores",
                      label: "Lista de proveedores",
                    },
                  ].map((item, index) => (
                    <Col xs={24} sm={8} key={index}>
                      <Link to={item.to}>
                        <Card
                          hoverable
                          className="h-full text-center flex items-center justify-center"
                          style={{}}
                        >
                            {item.label}
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} md={12} lg={8} key={i}>
                <Card className="flex justify-center items-center h-50">
                  <div className="flex flex-col items-center gap-4">
                    <GiSpinningBlades
                      className="animate-spin text-amber-500"
                      size={"3rem"}
                    />
                    <Text type="secondary">En desarrollo módulo {i}...</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
  );
}
