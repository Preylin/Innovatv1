import { useMemo } from "react";
import type { WeatherOutApiType } from "../model/api/weather-schema-api";
import { WeatherManager, type WeatherManagerData } from "../model/ManagerData";

export function useManagerDataWeather(apiData: WeatherOutApiType[] | undefined) {
  
  // 1. Normalizamos los datos de la API
  const dataNormalizada = useMemo<WeatherManagerData[]>(() => {
    if (!apiData) return [];

    return apiData.map((item, index) => ({
      key: index + 1,
      id: item.id,
      cliente_id: item.cliente_id,
      nro_documento: item.nro_documento || "",
      razon_social: item.razon_social || "",
      ubicacion_id: item.ubicacion_id,
      ubicacion: item.ubicacion || "",
      fecha_inicio: item.fecha_inicio || "",
      fecha_fin: item.fecha_fin || "",
      fact_relacionada: item.fact_relacionada || "",
      estado: item.estado || "",
      adicional: item.adicional || "",
      dias_counter: WeatherManager.calcularTextoVencimiento(item.fecha_fin, item.estado),
    }));
  }, [apiData]);

  // 2. Instanciamos la clase controladora
  const manager = useMemo(() => new WeatherManager(dataNormalizada), [dataNormalizada]);

  return {
    weatherList: manager.getData(),
    manager,                      
  };
}