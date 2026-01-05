// src/components/atoms/Card/Card.tsx
import { type FC } from "react";
import BaseCard, { type UICardProps } from "../../../ui/antd/card/CardWrapper";

export interface CardAtomProps extends UICardProps {
  /** Elimina padding interno si se necesita */
  noPadding?: boolean;
  /** Clase extra para layout */
  className?: string;
}

const CardAtom: FC<CardAtomProps> = ({
  noPadding = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <BaseCard
      {...rest}
      className={className}
      style={noPadding ? { padding: 0 } : undefined}
    >
      {children}
    </BaseCard>
  );
};

export default CardAtom;
