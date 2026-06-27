import { useMemo } from "react";

import { ProManager, type ProManagerData } from "../model/ManagerData";
import type { ProOutApiType } from "../model/api/pro-schema-api";

export function useManagerDataPro(apiData: ProOutApiType[] | undefined) {
  
  // 1. Normalizamos los datos de la API
  const dataNormalizada = useMemo<ProManagerData[]>(() => {
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
      dias_counter: ProManager.calcularTextoVencimiento(item.fecha_fin, item.estado),
    }));
  }, [apiData]);

  // 2. Instanciamos la clase controladora
  const manager = useMemo(() => new ProManager(dataNormalizada), [dataNormalizada]);

  return {
    ProList: manager.getData(), // Retorna directamente el Array listo para el .map()
    manager,                        // Retorna la clase por si quieres llamar a manager.updateData() en un botón
  };
}