export interface Row {
  key: number;
  id: number;
  fecha: string;
  descripcion: string;
  referencia: string | null;
  ingreso: number;
  egreso: number;
  adicionales: string | null;
  saldo: number;
}