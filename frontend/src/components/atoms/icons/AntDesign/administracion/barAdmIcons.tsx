import { AliyunOutlined, BarChartOutlined, BoxPlotOutlined, ContactsOutlined, DotChartOutlined, ProductOutlined, ProfileOutlined, RadarChartOutlined, ScheduleOutlined, SolutionOutlined, SortDescendingOutlined, TeamOutlined } from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";
import { AccionesIcons, IconsUsoComun } from "../IconsGeneral";

type IconComponent = ForwardRefExoticComponent<AntdIconProps & RefAttributes<HTMLSpanElement>>;

const BarAdministracionIcons = {
    actividades: ScheduleOutlined,
    cotizaciones: ProfileOutlined,
    ordenes: SolutionOutlined,
    productAdq: ProductOutlined,
    usuarios: TeamOutlined,
    weather: DotChartOutlined,
    pro: BoxPlotOutlined,
    chips: AliyunOutlined,
    servicios: BarChartOutlined,
    monitoreo: RadarChartOutlined,
    contactos: ContactsOutlined,
    historial: SortDescendingOutlined
} satisfies Record<string, IconComponent>;

export const IconRegistry = {
    ...BarAdministracionIcons,
    ...AccionesIcons,
    ...IconsUsoComun
} satisfies Record<string, IconComponent>;

export type IconKey = keyof typeof IconRegistry;

interface UseComponentProps extends AntdIconProps {
    name: IconKey;
}

export function UseBarAdministracionIcons({ name, ...props }: UseComponentProps) {
    const Icon = IconRegistry[name];
    
    if (!Icon) return null;

    return <Icon {...props} />;
}