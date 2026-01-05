import { Modal } from "antd";
import type { ReactNode, CSSProperties } from "react";

export interface ModalUIProps {
  open: boolean;
  title?: ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  width?: number;
  full?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
}

function BaseModal({
  open,
  title,
  onClose,
  onConfirm,
  okText,
  cancelText,
  confirmLoading,
  width,
  footer,
  full = false,
  children,
  maskClosable = true,
  keyboard = true,
  closable = true,
}: ModalUIProps) {
  const style: CSSProperties | undefined = full
    ? { top: 0, paddingBottom: 0 }
    : undefined;

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={onConfirm}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      maskClosable={maskClosable}
      keyboard={keyboard}
      closable={closable}
      width={full ? "100%" : width}
      footer={footer}
      style={style}
      styles={{body:full ? { height: "calc(100vh - 110px)" } : undefined}}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}

export default BaseModal;