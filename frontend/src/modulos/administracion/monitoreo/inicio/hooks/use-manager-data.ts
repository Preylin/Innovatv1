import { MonitoreoInicioManager, type DataTypeInicioMonitoreo } from "../model/MaganerData";
import { useMemo } from "react";
import type { CalendarVencimientosApiType } from "../model/api/monitoreo-inicio-schema";

export function useManagerVencimientoMonitoreo(data: CalendarVencimientosApiType[] | undefined) {
  
  const dataNormalizado = useMemo<DataTypeInicioMonitoreo>(() => {
    const baseObject: DataTypeInicioMonitoreo = {
      total_registros: 0,
      menores_cero: 0,
      iguales_cero: 0,
      mayores_cero_hasta_30: 0,
      mayores_30: 0,
    };

    if (!data || data.length === 0) return baseObject;

    return data.reduce<DataTypeInicioMonitoreo>((acumulador, item) => {
      const dias = MonitoreoInicioManager.calcularDays(item.fecha_fin);

      if (dias < 0) {
        acumulador.menores_cero++;
      } else if (dias === 0) {
        acumulador.iguales_cero++;
      } else if (dias <= 30) {
        acumulador.mayores_cero_hasta_30++;
      } else {
        acumulador.mayores_30++;
      }
      acumulador.total_registros++;

      return acumulador;
    }, baseObject);

  }, [data]);

  const managerData = useMemo(() => new MonitoreoInicioManager([dataNormalizado]), [dataNormalizado]);

  return {
    managerData,
  };
}