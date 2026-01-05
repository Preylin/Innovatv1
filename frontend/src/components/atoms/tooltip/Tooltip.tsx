import type { FC } from "react";
import BaseTooltip, { type UITooltipProps } from "../../../ui/antd/tooltip/TooltipWrapper";

export interface TooltipAtomProps extends Omit<UITooltipProps, "title"> {
  /** Contenido del tooltip */
  content: React.ReactNode;
  /** Posición por defecto controlada por el design system */
  placement?: UITooltipProps["placement"];
  /** Habilitar/deshabilitar rápidamente */
  disabled?: boolean;
  className?: string;
}

export const TooltipAtom: FC<TooltipAtomProps> = ({
  content,
  placement = "top",
  disabled = false,
  className = "",
  children,
  ...rest
}) => {
  if (disabled) return <>{children}</>;

  return (
    <BaseTooltip
      title={content}
      placement={placement}
      className={className}
      {...rest}
    >
      {/* Antd requiere un único elemento hijo */}
      <span className="inline-flex">{children}</span>
    </BaseTooltip>
  );
};

export default TooltipAtom;
