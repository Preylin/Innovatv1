import { Popconfirm } from "antd";
import type { ReactNode } from "react";

export interface PopconfirmUIProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  disabled?: boolean;
  children: ReactNode;
}

function BasePopconfirm({
  title,
  description,
  onConfirm,
  onCancel,
  okText,
  cancelText,
  disabled,
  children,
}: PopconfirmUIProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      disabled={disabled}
    >
      {children}
    </Popconfirm>
  );
}

export default BasePopconfirm;