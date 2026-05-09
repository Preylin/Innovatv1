export interface Row {
  id: number;
  fecha: string;
  descripcion: string;
  referencia: string | null;
  ingreso: number;
  egreso: number;
  adicionales: string | null;
  saldo: number; // <-- Añade el signo de interrogación aquí
}