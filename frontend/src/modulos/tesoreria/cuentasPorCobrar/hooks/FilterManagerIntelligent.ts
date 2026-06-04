import { differenceInCalendarDays, isValid, isWithinInterval } from "date-fns";

export interface DataGeneral {
  key: string;
  nombre: string;
  fecha_vencimiento: Date | null;
  moneda: string;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
  tabla: string;
  is_check: boolean;
  dias: string;
}

export interface SaldosFinancieros {
  saldo_caja_chica: number;
  saldo_bcp_soles: number;
  saldo_bcp_dolares: number;
}

export class FilterManagerIntelligence {
  private readonly data: DataGeneral[];
  private readonly saldos: SaldosFinancieros;

  constructor(data: DataGeneral[], saldos?: SaldosFinancieros) {
    this.data = data;
    this.saldos = saldos || { saldo_caja_chica: 0, saldo_bcp_soles: 0, saldo_bcp_dolares: 0 };
  }

  /**
   * Filtra los datos por un rango de fechas basado en la fecha de vencimiento.
   */
  public filtrarPorRangoFecha(rango: [Date | null, Date | null] | null): FilterManagerIntelligence {
    if (!rango || !rango[0] || !rango[1]) return this;
    const [inicio, fin] = rango;

    const datosFiltrados = this.data.filter((item) => {
      if (!item.fecha_vencimiento) return false;
      return isWithinInterval(item.fecha_vencimiento, { start: inicio, end: fin });
    });

    return new FilterManagerIntelligence(datosFiltrados, this.saldos);
  }

  /**
   * Clasifica y retorna las Cuentas por Cobrar (VENTAS)
   */
  public obtenerCuentasPorCobrar(): DataGeneral[] {
    return this.data.filter((item) => item.tabla === "VENTAS");
  }

  /**
   * Clasifica y retorna las Cuentas por Pagar (COMPRAS, OF, OE)
   */
  public obtenerCuentasPorPagar(): DataGeneral[] {
    return this.data.filter((item) => ["COMPRAS", "OF", "OE"].includes(item.tabla));
  }

  /**
   * Calcula los totales dinámicos (Soles y Dólares) de un grupo de cuentas basándose en is_check
   */
  public calcularTotalesGrupo(cuentas: DataGeneral[]) {
    return cuentas.reduce(
      (totales, item) => {
        if (item.is_check) {
          if (item.moneda === "PEN") {
            totales.soles += item.monto_pendiente;
          } else if (item.moneda === "USD") {
            totales.dolares += item.monto_pendiente;
          }
        }
        return totales;
      },
      { soles: 0, dolares: 0 }
    );
  }

  /**
   * Calcula el gran total combinando Saldos Iniciales + Cobros Seleccionados - Pagos Seleccionados
   */
  public calcularTotalGeneral(totalesCobrar: { soles: number; dolares: number }, totalesPagar: { soles: number; dolares: number }) {
    const totalSolesInicial = this.saldos.saldo_caja_chica + this.saldos.saldo_bcp_soles;
    const totalDolaresInicial = this.saldos.saldo_bcp_dolares;

    return {
      soles: totalSolesInicial + totalesCobrar.soles - totalesPagar.soles,
      dolares: totalDolaresInicial + totalesCobrar.dolares - totalesPagar.dolares,
    };
  }

  /**
   * Utilidad estática para calcular el estado de vencimiento en Perú (UTC simulado)
   */
  public static calcularTextoVencimiento(fechaVencimientoRaw: Date | string | null | undefined): string {
    if (!fechaVencimientoRaw) return "Sin Fecha";

    const fechaVencimiento = new Date(fechaVencimientoRaw);
    if (!isValid(fechaVencimiento)) return "Fecha Inválida";

    const hoyLocal = new Date();
    const hoyUTC = new Date(Date.UTC(hoyLocal.getFullYear(), hoyLocal.getMonth(), hoyLocal.getDate()));
    const vencimientoUTC = new Date(
      Date.UTC(fechaVencimiento.getUTCFullYear(), fechaVencimiento.getUTCMonth(), fechaVencimiento.getUTCDate())
    );

    const dias = differenceInCalendarDays(vencimientoUTC, hoyUTC);

    if (dias > 0) return `Faltan ${dias} ${dias === 1 ? "día" : "días"}`;
    if (dias === 0) return "Vence Hoy";
    return `Vencido (${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"})`;
  }
}