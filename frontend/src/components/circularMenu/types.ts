import type { ImagesHome } from "../../assets/images";

export type IconKey = keyof typeof ImagesHome;

export interface Modulo {
  id: number;
  name: string;
  to: string;
  iconKey?: IconKey;
}

export interface LoginResult {
  route: string;
  isAllowed: boolean;
  moduleName: string;
}

export const Modulos: Modulo[] = [
  { id: 1, name: "Gerencia", to: "gerencia", iconKey: "gerencia" },
  { id: 2, name: "Administración", to: "administracion", iconKey: "administracion" },
  { id: 3, name: "Contabilidad", to: "contabilidad", iconKey: "contabilidad" },
  { id: 4, name: "Tesorería", to: "tesoreria", iconKey: "tesoreria" },
  { id: 5, name: "Recursos Humanos", to: "rrhh", iconKey: "rrhh" },
  { id: 6, name: "Ventas", to: "ventas", iconKey: "ventas" },
  { id: 7, name: "Almacén", to: "almacen", iconKey: "almacen" },
  { id: 8, name: "Producción", to: "produccion", iconKey: "produccion" },
];