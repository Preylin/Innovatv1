import { 
    CheckOutlined,
  DeleteOutlined, 
  EditOutlined, 
  ExclamationOutlined, 
  EyeOutlined, 
  MinusOutlined, 
  PlusOutlined, 
  SearchOutlined,
  SlackOutlined
} from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";

type IconComponent = ForwardRefExoticComponent<AntdIconProps & RefAttributes<HTMLSpanElement>>;

export const AccionesIcons = {
    agregar: PlusOutlined,
    disminuir: MinusOutlined,
    eliminar: DeleteOutlined,
    editar: EditOutlined,
    ver: EyeOutlined,
    pendiente: ExclamationOutlined,
    consultar: SearchOutlined,
    realizado: CheckOutlined
} satisfies Record<string, IconComponent>;

export const IconsUsoComun = {
    inicio: SlackOutlined,
} satisfies Record<string, IconComponent>;



// type IconKey = keyof typeof AccionesIcons;


// interface UseComponentProps extends AntdIconProps {
//     name: IconKey;
// }

// export function UseAcconesIcons({ name, ...props }: UseComponentProps) {
//     const Icon = AccionesIcons[name];
    
//     if (!Icon) return null;

//     return <Icon {...props} />;
// }