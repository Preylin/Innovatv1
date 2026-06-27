import { useMemo } from "react";
import {
  ManagerChipsInventario,
  type ManagerChipsInventarioData,
} from "../model/ManagerData";
import type { ChipInventarioOutApiType } from "../model/api/chips-inventario-schema";

export function useManagerDataChipsInventario(
  apiData: ChipInventarioOutApiType[] | undefined,
) {
  // 1. Normalizamos los datos de la API
  const dataNormalizada = useMemo<ManagerChipsInventarioData[]>(() => {
    if (!apiData) return [];

    return apiData.map((item, index) => ({
      key: index + 1,
      id: item.id,
      numero_chip: item.numero_chip || "",
      iccid: item.iccid || "",
      operador: item.operador || "",
      plan: item.plan || "",
      fecha_activacion: item.fecha_activacion || "",
      fecha_instalacion: item.fecha_instalacion || "",
      adicional: item.adicional || "",
    }));
  }, [apiData]);

  // 2. Creamos el ManagerData
  const managerData = useMemo(
    () => new ManagerChipsInventario(dataNormalizada),
    [dataNormalizada],
  );

  return {
    ChipsInventarioList: managerData.getData(), // Retorna directamente el Array listo para el .map()
    managerData,
  };
}
