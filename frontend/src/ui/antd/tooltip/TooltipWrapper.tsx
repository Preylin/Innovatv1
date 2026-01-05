// src/ui/antd/Tooltip.tsx
import React from "react";
import { Tooltip as AntdTooltip } from "antd";
import type { TooltipProps as AntdTooltipProps } from "antd";

export type UITooltipProps = AntdTooltipProps;

export const BaseTooltip: React.FC<UITooltipProps> = (props) => {
  return <AntdTooltip {...props} />;
};

export default BaseTooltip;
