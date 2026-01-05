import { type FC } from 'react';
import { Button as AntdButton } from 'antd';
import type { ButtonProps as AntdButtonProps } from 'antd';
import clsx from 'clsx';

export type BaseButtonProps = AntdButtonProps & {
  tw?: string; // clases Tailwind adicionales
};

export const BaseButton: FC<BaseButtonProps> = ({ className, tw = '', children, ...rest }) => {
  // Dejar a Antd controlar color/tema; usar Tailwind para spacing/layout
  const classes = clsx(tw, className);
  return (
    <AntdButton {...rest} className={classes}>
      {children}
    </AntdButton>
  );
};


/*
* ...rest
href: convierte el bton en un enlace.
htmlType?: "button" | "submit" | "reset"
"button": botón normal
"submit": envía un formulario HTML.
"reset": reinicia un formulario HTML.
type?: "link" | "text" | "primary" | "dashed" | "default"
primary	Botón principal, color primario
default	Botón estándar
dashed	Botón con borde punteado
text	Botón sin fondo ni borde, tipo “texto”
link	Botón estilo enlace
color?: "..."
"danger" | "primary" | "default" | "blue" | "purple" | "cyan" | "green" | "magenta" | "pink" | "red" | "orange" | "yellow" | "volcano" | "geekblue" | "lime" | "gold"
variant?: "link" | "text" | "outlined" | "dashed" | "solid" | "filled"
solid	Botón sólido (similar a primary)
outlined	Borde visible, fondo transparente
dashed	Igual a outlined pero con borde punteado
filled	Fondo sólido con color de token
text	Solo texto
link	Enlace visual
*/