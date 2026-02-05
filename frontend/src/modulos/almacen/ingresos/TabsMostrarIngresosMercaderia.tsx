import { Tabs, type TabsProps } from "antd";
import { UseBarAlmacenIcons } from "../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import TablaMostrarIngresoMercaderia from "./mercaderia/TablaMostrarIngresoMercaderia";
import TablaMostrarIngresoMaterial from "./material/TablaMostrarIngresoMaterial";


function TabsShowIngresosMercaderias() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <TablaMostrarIngresoMercaderia />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <TablaMostrarIngresoMaterial />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
      <Tabs
      style={{minWidth: '500px'}}
       defaultActiveKey="1" items={items}></Tabs>
  );
}

export default TabsShowIngresosMercaderias;