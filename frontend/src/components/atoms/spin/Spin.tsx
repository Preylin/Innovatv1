import type { FC } from "react";
import { BaseSpin, type UISpinProps } from "../../../ui/antd/spin/SpinWrapper";

export interface SpinAtomProps extends UISpinProps {
  /** Centra el spinner automáticamente en un contenedor flex */
  center?: boolean;
  className?: string;
}

export const SpinAtom: FC<SpinAtomProps> = ({
  center = false,
  className = "",
  ...rest
}) => {
  return (
    <div
      className={
        center
          ? `flex justify-center items-center ${className}`
          : className
      }
    >
      <BaseSpin {...rest} />
    </div>
  );
};

export default SpinAtom;
