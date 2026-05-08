import { Link, Outlet, createLazyFileRoute } from "@tanstack/react-router";
import { Card, Col, Row, Typography } from "antd";
const { Title, Text } = Typography;

export const Route = createLazyFileRoute("/gerencia/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-1">
      <PanelGeneralGerencia />
      <Outlet />
    </div>
  );
}

function PanelGeneralGerencia() {
  return (
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
                    to: "/gerencia/usuarios",
                    label: "Panel de acceso a usuarios al SISTEMA",
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


  );
}

