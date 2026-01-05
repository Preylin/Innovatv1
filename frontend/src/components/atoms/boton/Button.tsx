import type { FC } from "react";
import {
  BaseButton,
  type BaseButtonProps,
} from "../../../ui/antd/boton/ButtonWrapper";

type ButtonProps = Omit<BaseButtonProps, "tw"> & {
  variant?: "link" | "text" | "outlined" | "dashed" | "solid" | "filled";
  color?:
    | "danger"
    | "primary"
    | "default"
    | "blue"
    | "purple"
    | "cyan"
    | "green"
    | "magenta"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "volcano"
    | "geekblue"
    | "lime"
    | "gold";
  className?: string;
};

const ButtonAtom: FC<ButtonProps> = ({
  variant = 'solid',
  color = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const tw = variant === 'solid' ? 'font-semibold' : 'font-medium';

  return (
    <BaseButton
      {...rest}
      variant={variant}
      color={color}
      tw={tw}
      className={className}
    >
      {children}
    </BaseButton>
  );
};
export default ButtonAtom;
