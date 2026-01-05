import type { ReactNode } from "react";
import BasePopconfirm from "../../../ui/antd/popconfirm/Popconfirm";

interface PopconfirmAtomProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export function PopconfirmAtom({
  title,
  description,
  onConfirm,
  disabled = false,
  children,
}: PopconfirmAtomProps) {
  return (
    <BasePopconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="Aceptar"
      cancelText="Cancelar"
      disabled={disabled}
    >
      {children}
    </BasePopconfirm>
  );
}
