import { Tabs, type TabsProps } from "antd";
import { UseBarAlmacenIcons } from "../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import MercaderiaStatus from "./mercaderia/MostrarStatusMercaderia";
import MaterialStatus from "./material/MostrarStatusMaterial";


function TabsShowStatusRegistros() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <MercaderiaStatus />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <MaterialStatus />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
      <Tabs
      style={{minWidth: '700px'}}
      defaultActiveKey="1" items={items}></Tabs>
  );
}

export default TabsShowStatusRegistros;