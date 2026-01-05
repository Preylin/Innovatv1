import { createLazyFileRoute } from "@tanstack/react-router";
import CardAtom from "../../components/atoms/card/Card";
import UsuarioTable from "../../components/atoms/table/Tabla_panel_control";
import { useState } from "react";

import {  Button } from "antd";
import ModalAddNewUser from "../../components/organisms/Crear_usuarios_gerencia";

export const Route = createLazyFileRoute("/gerencia/usuarios")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="">
      <CardAtom
        title={<p className="font-bold text-2xl">Panel de control</p>}
        extra={<ModalNow />}
        variant="outlined"
      >
        <div className="overflow-hidden">
          <UsuarioTable />
        </div>
      </CardAtom>
      
    </div>
  );
}

function ModalNow() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Nuevo Usuario
      </Button>
      <ModalAddNewUser open={isModalOpen} onClose={handleCancel} />
    </div>
  );
}

