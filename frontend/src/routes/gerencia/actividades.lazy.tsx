import { createLazyFileRoute } from "@tanstack/react-router";
import CardAtom from "../../components/atoms/card/Card";
import UsuarioTable from "../../components/atoms/table/Tabla_panel_control";
import { ModalAtom } from "../../components/atoms/modal/Modal";
import React from "react";
import { Button } from "antd";

export const Route = createLazyFileRoute("/gerencia/actividades")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-wrap gap-3 bg-amber-200">

      <CardAtom title={"Usuarios"} extra={"Ver más"} variant="borderless">
        <div className="w-300 overflow-hidden">
          <UsuarioTable />
        </div>
      </CardAtom>

      {/* <ExampleModal /> */}
    </div>
  );
}


const ExampleModal: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const showLoading = () => {
    setOpen(true);
    setLoading(true);

    // Simple loading mock. You should add cleanup logic in real world.
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      <Button type="primary" onClick={showLoading}>
        Open Modal
      </Button>
      <ModalAtom
        title={<p className="text-red-300">Loading Modal</p>}
        footer={
          <Button type="primary" onClick={showLoading}>
            Reload
          </Button>
        }
        loading={loading}
        open={open}
        onClose={() => setOpen(false)}
      >
        <CardAtom title={"Usuarios"} extra={"Ver más"} variant="borderless">
        <div className="w-100 overflow-hidden">
          <UsuarioTable />
        </div>
      </CardAtom>
      </ModalAtom>
    </>
  );
};
