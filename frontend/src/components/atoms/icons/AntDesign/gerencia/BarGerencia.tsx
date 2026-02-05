import { CalendarOutlined, ProfileOutlined, ScheduleOutlined, SolutionOutlined, SortDescendingOutlined, TeamOutlined } from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";
import { AccionesIcons, IconsUsoComun } from "../IconsGeneral";

type IconComponent = ForwardRefExoticComponent<AntdIconProps & RefAttributes<HTMLSpanElement>>;

const BarGerenciaIcons = {
    actividades: ScheduleOutlined,
    cotizaciones: ProfileOutlined,
    ordenes: SolutionOutlined,
    usuarios: TeamOutlined,
    programacion: CalendarOutlined,
    historial: SortDescendingOutlined,
} satisfies Record<string, IconComponent>;

export const IconRegistry = {
    ...BarGerenciaIcons,
    ...AccionesIcons,
    ...IconsUsoComun
} satisfies Record<string, IconComponent>;

export type IconKey = keyof typeof IconRegistry;

interface UseComponentProps extends AntdIconProps {
    name: IconKey;
}

export function UseBarGerenciaIcons({ name, ...props }: UseComponentProps) {
    const Icon = IconRegistry[name];
    
    if (!Icon) return null;

    return <Icon {...props} />;
}