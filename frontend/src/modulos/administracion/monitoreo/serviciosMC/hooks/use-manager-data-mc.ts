import { useMemo } from "react";
import { MCManager, type MCManagerData } from "../model/ManagerData";
import type { McOutApiType } from "../model/api/mc-schema";

export function useManagerDataMC(apiData: McOutApiType[] | undefined) {
  // 1. Normalizamos los datos de la API
  const dataNormalizada = useMemo<MCManagerData[]>(() => {
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
      informe: item.informe || "",
      certificado: item.certificado || "",
      encargado: item.encargado || "",
      tecnico: item.tecnico || "",
      servicio: item.servicio || "",
      incidencia: item.incidencia || "",
      dias_counter: MCManager.calcularTextoVencimiento(
        item.fecha_fin,
        item.estado,
      ),
    }));
  }, [apiData]);

  // 2. Instanciamos la clase controladora
  const manager = useMemo(
    () => new MCManager(dataNormalizada),
    [dataNormalizada],
  );

  return {
    MCList: manager.getData(), // Retorna directamente el Array listo para el .map()
    manager, // Retorna la clase por si quieres llamar a manager.updateData() en un botón
  };
}
