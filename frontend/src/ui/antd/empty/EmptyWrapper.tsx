import React from "react";
import { Empty as AntdEmpty } from "antd";
import type { EmptyProps as AntdEmptyProps } from "antd";

export type UIEmptyProps = AntdEmptyProps;

export const BaseEmpty: React.FC<UIEmptyProps> = (props) => {
  return <AntdEmpty {...props} />;
};

export default BaseEmpty;
