import { useMemo } from "react";
import { Personal } from "../utils/Personal";
import type { DataCruda } from "../types/personaTypes";

// Definimos el tipo de entrada para mayor seguridad
export const usePersonalData = (dataFromApi: DataCruda[] = []) => {
  return useMemo(() => {
    // Si no hay data, devolvemos un estado inicial vacío
    if (!dataFromApi || dataFromApi.length === 0) {
      return { data: [], totales: {} as Record<string, string> };
    }

    // 1. Transformamos los datos crudos
    const dataTransformada = dataFromApi.map((item) => {
      const remTotal = item.rem_basico + item.asig_familiar;
      const sumaTotal = remTotal + item.grati + item.cts + item.vacacion;
      return {
        ...item,
        rem_total: remTotal,
        soles: Number(sumaTotal.toFixed(2)),
        dolares: Number((sumaTotal / 3.5).toFixed(2)),
      };
    });

    // 2. Procesamos con la clase Personal
    const helper = new Personal(dataTransformada);

    return {
      data: dataTransformada,
      totales: {
        sueldos: helper.sumarColumna("rem_basico").toLocaleString("en-US"),
        asig: helper.sumarColumna("asig_familiar").toLocaleString("en-US"),
        remTotal: helper.sumarColumna("rem_total").toLocaleString("en-US"),
        grati: helper.sumarColumna("grati").toLocaleString("en-US"),
        cts: helper.sumarColumna("cts").toLocaleString("en-US"),
        vacacion: helper.sumarColumna("vacacion").toLocaleString("en-US"),
        soles: helper.sumarColumna("soles").toLocaleString("en-US"),
        dolares: helper.sumarColumna("dolares").toLocaleString("en-US"),
      },
    };
  }, [dataFromApi]); // <--- IMPORTANTE: Se recalcula cada vez que la API actualiza la data
};
