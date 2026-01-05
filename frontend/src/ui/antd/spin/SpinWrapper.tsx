// src/ui/antd/Spin.tsx
import React from "react";
import { Spin as AntdSpin } from "antd";
import type { SpinProps as AntdSpinProps } from "antd";

export type UISpinProps = AntdSpinProps;

export const BaseSpin: React.FC<UISpinProps> = (props) => {
  return <AntdSpin {...props} />;
};

export default BaseSpin;
