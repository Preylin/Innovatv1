import { Tabs, type TabsProps } from "antd";
import { UseBarAlmacenIcons } from "../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import TablaMostrarSalidaMercaderia from "./mercaderia/TablaMostrarSalidaMercaderia";
import TablaMostrarSalidaMaterial from "./material/TablaMostrarSalidaMaterial";


function TabsShowSalidasMercaderias() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <TablaMostrarSalidaMercaderia />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <TablaMostrarSalidaMaterial />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
      <Tabs
      style={{minWidth: '500px'}}
       defaultActiveKey="1" items={items}></Tabs>
  );
}

export default TabsShowSalidasMercaderias;