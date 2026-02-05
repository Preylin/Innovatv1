import { Tabs, type TabsProps } from "antd";
import { UseBarAlmacenIcons } from "../../../components/atoms/icons/AntDesign/almacen/barAlmacen";
import MostrarRegistrosMercaderias from "./mercaderias/MostrarRegistrosMercaderias";
import MostrarRegistrosMateriales from "./materiales/MostrarRegistrosMaterial";


function TabsShowCatalogosRegistros() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Mercadería",
      children: <MostrarRegistrosMercaderias />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
    {
      key: "2",
      label: "Materiales",
      children: <MostrarRegistrosMateriales />,
      icon: <UseBarAlmacenIcons name="activosAreas" />,
    },
  ];

  return (
      <Tabs
      style={{minWidth: '500px'}}
      defaultActiveKey="1" items={items}></Tabs>
  );
}

export default TabsShowCatalogosRegistros;