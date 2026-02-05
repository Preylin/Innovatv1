import { createFileRoute, redirect } from "@tanstack/react-router";
import { Modal } from "antd";
import ButtomNew from "../components/molecules/botons/BottomNew";
import { useToggle } from "../hooks/Toggle";


export const Route = createFileRoute("/contabilidad")({
  beforeLoad: async ({ context }) => {
    const auth = context.auth;
    await auth.ensureReady();

    if (!auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});


function RouteComponent() {
 const { isToggled: isToggled1, toggle: toggle1, setOff: setOff1 } = useToggle();
 const { isToggled: isToggled2, toggle: toggle2, setOff: setOff2} = useToggle();


 return(
  <>
  <ButtomNew onClick={toggle1} />
  <ButtomNew onClick={toggle2} />
  <ExampelModal open={isToggled1} onOk={setOff1} onCancel={setOff1}/>
  <ExampelModal2 open={isToggled2} onOk={setOff2} onCancel={setOff2}/>
  </>
 )
}



function ExampelModal(
  {open, 
  onOk, 
  onCancel,}: {open: boolean, onOk: () => void, onCancel: () => void}
){

  return(
    <Modal
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    >
      <h1>Hola</h1>
    </Modal>
  )
}

function ExampelModal2 (
  {open, onOk, onCancel}: {open: boolean, onOk: () => void, onCancel: () => void}
){

  return(
    <Modal
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    >
      <h1>Hola caso 2</h1>
    </Modal>
  )
}