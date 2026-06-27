import { differenceInCalendarDays, isValid } from "date-fns";

export interface WeatherManagerData {
  key: number;
  id: number;
  cliente_id: number;
  nro_documento: string;
  razon_social: string;
  ubicacion_id: number;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string;
  fact_relacionada: string;
  estado: string;
  adicional: string;
  dias_counter: string;
}

export class WeatherManager {
  private data: WeatherManagerData[] = [];

  constructor(initialData: WeatherManagerData[]) {
    this.data = initialData;
  }

  // Funciones síncronas para evitar lidiar con Promesas en el renderizado
  getData(): WeatherManagerData[] {
    return this.data;
  }

  getDataById(id: number): WeatherManagerData | undefined {
    return this.data.find((d) => d.id === id);
  }

  createData(newItem: WeatherManagerData): void {
    this.data.push(newItem);
  }

  updateData(id: number, updatedItem: WeatherManagerData): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data[index] = updatedItem;
    }
  }

  deleteData(id: number): void {
    const index = this.data.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }

  public static calcularTextoVencimiento(
    fechaVencimientoRaw: Date | string | null | undefined,
    estado: string,
  ): string {
    if (!fechaVencimientoRaw) return "Sin Fecha";
    if (estado === "PENDIENTE") {
      const fechaVencimiento = new Date(fechaVencimientoRaw);
      if (!isValid(fechaVencimiento)) return "Fecha Inválida";

      const hoyLocal = new Date();
      const hoyUTC = new Date(
        Date.UTC(
          hoyLocal.getFullYear(),
          hoyLocal.getMonth(),
          hoyLocal.getDate(),
        ),
      );
      const vencimientoUTC = new Date(
        Date.UTC(
          fechaVencimiento.getUTCFullYear(),
          fechaVencimiento.getUTCMonth(),
          fechaVencimiento.getUTCDate(),
        ),
      );

      const dias = differenceInCalendarDays(vencimientoUTC, hoyUTC);

      if (dias > 0) return `Faltan ${dias} ${dias === 1 ? "día" : "días"}`;
      if (dias === 0) return "Vence Hoy";
      return `Vencido (${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"})`;
    }

    else return estado;
  }
}
