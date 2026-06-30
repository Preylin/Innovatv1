
export interface DataTypeInicioMonitoreo {
  total_registros: number;
  menores_cero: number;
  iguales_cero: number;
  mayores_cero_hasta_30: number;
  mayores_30: number;
}

export class MonitoreoInicioManager {
  private data: DataTypeInicioMonitoreo[] = [];

  constructor(initialData: DataTypeInicioMonitoreo[]) {
    this.data = initialData;
  }

  getData() {
    return this.data;
  }

  public static calcularDays(fechaISO: string): number {
    if (!fechaISO) return 0;

    const destino = new Date(fechaISO);
    const hoy = new Date();

    if (isNaN(destino.getTime())) return 0;

    const utc1 = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const utc2 = Date.UTC(
      destino.getFullYear(),
      destino.getMonth(),
      destino.getDate(),
    );

    const msPorDia = 1000 * 60 * 60 * 24;

    return Math.floor((utc2 - utc1) / msPorDia);
  }
}