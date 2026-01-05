import { Card as AntdCard } from "antd";
import type { CardProps as AntdCardProps } from "antd";
import type { FC } from "react";

export type UICardProps = AntdCardProps;

export const BaseCard: FC<UICardProps> = ({ children, ...props }) => {
    return <AntdCard {...props}>{children}</AntdCard>;
};

export default BaseCard;
