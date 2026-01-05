import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import CrearClienteModal from "../../../modulos/administracion/monitoreo/ModalClientesCreate";
import CrearUbicacionesModal from "../../../modulos/administracion/monitoreo/ModalUbicacionesCreate";
import { Button } from "antd";
import { ClientesShow } from "../../../components/organisms/example";

export const Route = createLazyFileRoute("/administracion/monitoreo/inicio")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openCliente, isOpenCliente] = useState(false);
  const [openUbicaciones, isOpenUbicaciones] = useState(false);

  const handleOpenCliente = () => {
    isOpenCliente(true);
  };
  const handleCloseCliente = () => {
    isOpenCliente(false);
  };

  const handleOpenUbicaciones = () => {
    isOpenUbicaciones(true);
  };
  const handleCloseUbicaciones = () => {
    isOpenUbicaciones(false);
  };


  return (
    <div>
      <Button onClick={handleOpenCliente}>Crear cliente</Button>
      <Button onClick={handleOpenUbicaciones}>Crear Ubicaciones</Button>

      <CrearClienteModal open={openCliente} onClose={handleCloseCliente}/>

      <CrearUbicacionesModal open={openUbicaciones} onClose={handleCloseUbicaciones}/>
      
      <ClientesShow />
    </div>
  );
}


