import type { ReactNode } from "react";
import BaseModal from "../../../ui/antd/modal/Modal";

interface ModalAtomProps {
  open: boolean;
  title?: ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  full?: boolean;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
}

export function ModalAtom({
  open,
  title,
  onClose,
  onConfirm,
  loading = false,
  full = false,
  width = 520,
  footer,
  children,
  maskClosable = true,
  keyboard = true,
  closable
}: ModalAtomProps) {
  return (
    <BaseModal
      open={open}
      title={title}
      onClose={onClose}
      onConfirm={onConfirm}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={loading}
      maskClosable={maskClosable}
      keyboard={keyboard}
      full={full}
      width={width}
      footer={footer}
      closable={closable}
    >
      {children}
    </BaseModal>
  );
}
