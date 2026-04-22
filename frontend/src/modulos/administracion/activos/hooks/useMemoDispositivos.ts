import { useMemo } from "react";
import type { DataCruda } from "../types/dispositivosTypes";
import { Dispositivos } from "../utils/Dispositivos";

// Definimos el tipo de entrada para mayor seguridad
export const useDispositivosData = (dataFromApi: DataCruda[] = []) => {
  return useMemo(() => {
    // Si no hay data, devolvemos un estado inicial vacío
    if (!dataFromApi || dataFromApi.length === 0) {
      return { data: [], totales: {} as Record<string, string> };
    }

    // 1. Transformamos los datos crudos
    const dataTransformada = dataFromApi.map((item) => {

      return {
        ...item,
        montoPorDepreciar: item.valor -  item.monto_depresiado,


      };
    });

    // 2. Procesamos con la clase Personal
    const helper = new Dispositivos(dataTransformada);

    return {
      data: dataTransformada,
      totales: {
        valores: helper.sumarColumna("valor").toLocaleString("en-US"),
        depreciar: helper.sumarColumna("montoPorDepreciar").toLocaleString("en-US"),
        depreciado: helper.sumarColumna("monto_depresiado").toLocaleString("en-US"),

      },
    };
  }, [dataFromApi]); // <--- IMPORTANTE: Se recalcula cada vez que la API actualiza la data
};
