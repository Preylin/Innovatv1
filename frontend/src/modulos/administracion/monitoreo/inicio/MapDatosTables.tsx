import type { ChipServicioOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/chipservicio/chipservicio.api.schema";
import type { ProOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/pro/pro.api.schema";
import type { ServiciosMCOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/serviciosMC/serviciosMC.api.schema";
import type { WeatherOutApiType } from "../../../../api/queries/modulos/administracion/monitoreo/weather/weather.api.schema";
import isoToDDMMYYYY from "../../../../helpers/Fechas";


//Funcion para calular los dias entre una fecha determinada en funcion de la fecha actual

const calcularDias = (fechaISO: string): number => {
  if (!fechaISO) return 0;

  const destino = new Date(fechaISO);
  const hoy = new Date();

  if (isNaN(destino.getTime())) return 0;

  const utc1 = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const utc2 = Date.UTC(
    destino.getFullYear(),
    destino.getMonth(),
    destino.getDate()
  );

  const msPorDia = 1000 * 60 * 60 * 24;

  return Math.floor((utc2 - utc1) / msPorDia);
};

//--- interface general ----
export interface DataTypeInicioMonitoreo {
  key: string;
  name: string;
  ubicacion: string;
  inicio: string;
  fin: string;
  status: number;
  tipTable: string;
  time: number;
}

export type DataIndex = keyof DataTypeInicioMonitoreo;

//--- Mapeo de datos peticion get weather ----

export const mapWeatherToTableInicio = (
  weather: WeatherOutApiType[]
): DataTypeInicioMonitoreo[] => {
  return weather.map((w) => ({
    key: w.id?.toString() ?? "-",
    name: w.name ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    status: w.status ?? -1,
    tipTable: "weather",
    time: calcularDias(w.fin ?? ""),
  }));
};

//--- Mapeo de datos peticion get pro ----

export const mapProTableInicio = (
  proData: ProOutApiType[]
): DataTypeInicioMonitoreo[] => {
  return proData.map((w) => ({
    key: w.id.toString(),
    name: w.name ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    status: w.status ?? -1,
    tipTable: "pro",
    time: calcularDias(w.fin ?? ""),
  }));
};

//--- Mapeo de datos peticion get chips ----
export const mapChipServicioTableInicio = (
  proData: ChipServicioOutApiType[]
): DataTypeInicioMonitoreo[] => {
  return proData.map((w) => ({
    key: w.id.toString(),
    name: w.name ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    status: w.status ?? -1,
    tipTable: "chip",
    time: calcularDias(w.fin ?? ""),
  }));
};

// ---Mapeo de datos peticion get serviciosMC ----
export const mapServiciosMCTableInicio = (proData: ServiciosMCOutApiType[]): DataTypeInicioMonitoreo[] => {
  return proData.map((w) => ({
    key: w.id.toString(),
    name: w.empresa ?? "-",
    ubicacion: w.ubicacion ?? "-",
    inicio: isoToDDMMYYYY(w.inicio) ?? "-",
    fin: isoToDDMMYYYY(w.fin) ?? "-",
    status: w.status ?? -1,
    tipTable: "serviciosMC",
    time: calcularDias(w.fin ?? ""),
  }));
};