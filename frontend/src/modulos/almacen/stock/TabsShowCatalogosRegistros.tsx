import { Tabs, type TabsProps } from "antd";
import { UseBarAlmacenIcons } from "../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import MostrarStockMercaderias from "./mercaderia/MostrarStockMercaderias";
import MostrarStockMaterial from "./material/MostrarStockMaterial";


function TabsShowStockRegistros() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <MostrarStockMercaderias />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <MostrarStockMaterial />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
      <Tabs
      style={{minWidth: '700px'}}
      defaultActiveKey="1" items={items}></Tabs>
  );
}

export default TabsShowStockRegistros;