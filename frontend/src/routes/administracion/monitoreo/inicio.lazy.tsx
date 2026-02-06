import { createLazyFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Col, Divider, Flex, Modal, Row, Skeleton, Typography } from "antd";
import ButtonWatch from "../../../components/molecules/botons/BottonWatch";
const { Title } = Typography;

  const LazyShowClientes = lazy(() => import('../../../modulos/administracion/monitoreo/clientesYUbicaciones/MostrarClientesUbicaciones'))
  const LazyPanelWPanelCollapseShowTables = lazy(() => import('../../../modulos/administracion/monitoreo/inicio/CollapseShowTables'));
  const LazyTableShowRegistrosTotales = lazy(() => import('../../../modulos/administracion/monitoreo/inicio/TablaConsultasWProChipsServiciosMc'));


export const Route = createLazyFileRoute("/administracion/monitoreo/inicio")({
  component: RouteComponent,
});


function RouteComponent(){
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Flex justify="space-between" align="center" style={{marginBottom: '4px'}} >
          <Title level={2}
            style={{ marginBottom: '1px', fontSize: 'clamp(1rem, 2vw + 0.5rem, 2rem)'}}
          >Monitoreo de servicios</Title>
          <ButtonWatch onClick={handleOpen}>
            Ver clientes
          </ButtonWatch>
          <Modal
            title="Lista de clientes y ubicaciones"
            open={open}
            onCancel={handleClose}
            footer={null}
            destroyOnHidden
            centered
            maskClosable={false}
            width={"95%"}
            styles={{
              body: {
                height: "80vh",
                overflowY: "auto",
                overflowX: "hidden",
              },
            }}
          >
            <Suspense fallback={<Skeleton active />}>
              <LazyShowClientes />
            </Suspense>
          </Modal>
        </Flex>
    <Row>
      <Col span={24}>
        <Suspense fallback={<Skeleton active />}>
          <LazyPanelWPanelCollapseShowTables />
        </Suspense>
      </Col>
    </Row>
    <Divider />
    <Row>
      <Col span={24}>
        <Suspense fallback={<Skeleton active />}>
          <LazyTableShowRegistrosTotales />
        </Suspense>
      </Col>
    </Row>
    </>
  )
}