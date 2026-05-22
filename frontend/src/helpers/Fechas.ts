function isoToDDMMYYYY(isoStr?: string | null): string {
  if (!isoStr) return "-";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return "-";

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export default isoToDDMMYYYY;


// Para trabajar de forma segura con fechas usando la libreria date-fns

import { format } from "date-fns";

export const renderFechaSegura = (
    fecha: string | null | undefined,
    formato = "dd/MM/yyyy",
  ) => {
    if (!fecha) return "-";
    try {
      return format(new Date(fecha), formato);
    } catch (error) {
      console.error("Error al formatear fecha:", fecha, error);
      return "-";
    }
  };