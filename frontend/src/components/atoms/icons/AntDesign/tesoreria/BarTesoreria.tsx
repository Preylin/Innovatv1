import { SwapOutlined } from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";
import { AccionesIcons, IconsUsoComun } from "../IconsGeneral";

type IconComponent = ForwardRefExoticComponent<AntdIconProps & RefAttributes<HTMLSpanElement>>;

const BarTesoreriaIcons = {
    cnt_efectivo: SwapOutlined

} satisfies Record<string, IconComponent>;

export const IconRegistry = {
    ...BarTesoreriaIcons,
    ...AccionesIcons,
    ...IconsUsoComun
} satisfies Record<string, IconComponent>;

export type IconKey = keyof typeof IconRegistry;

interface UseComponentProps extends AntdIconProps {
    name: IconKey;
}

export function UseBarTesoreriaIcons({ name, ...props }: UseComponentProps) {
    const Icon = IconRegistry[name];
    
    if (!Icon) return null;

    return <Icon {...props} />;
}