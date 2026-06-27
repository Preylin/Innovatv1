import { useMemo } from "react";
import { ChipsManager, type ChipsManagerData } from "../model/ManagerData";
import type { ChipsOutApiType } from "../model/api/chips-schema";

export function useManagerDataChips(apiData: ChipsOutApiType[] | undefined) {
  
  // 1. Normalizamos los datos de la API
  const dataNormalizada = useMemo<ChipsManagerData[]>(() => {
    if (!apiData) return [];

    return apiData.map((item, index) => ({
      key: index,
      id: item.id,
      cliente_id: item.cliente_id,
      nro_documento: item.nro_documento || "",
      razon_social: item.razon_social || "",
      ubicacion_id: item.ubicacion_id,
      ubicacion: item.ubicacion || "",
      chip_id: item.chip_id,
      numero_chip: item.numero_chip || "",
      fecha_inicio: item.fecha_inicio || "",
      fecha_fin: item.fecha_fin || "",
      fact_relacionada: item.fact_relacionada || "",
      estado: item.estado || "",
      adicional: item.adicional || "",
      dias_counter: ChipsManager.calcularTextoVencimiento(item.fecha_fin, item.estado),
    }));
  }, [apiData]);

  // 2. Instanciamos la clase controladora
  const manager = useMemo(() => new ChipsManager(dataNormalizada), [dataNormalizada]);

  return {
    ChipsList: manager.getData(), // Retorna directamente el Array listo para el .map()
    manager,                        // Retorna la clase por si quieres llamar a manager.updateData() en un botón
  };
}