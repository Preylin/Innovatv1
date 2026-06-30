import { useQuery } from "@tanstack/react-query";
import { createQuery } from "../../../../../../api/query/createQuery";
import api from "../../../../../../api/client";
import { CalendarVencimientosApiSchema } from "./monitoreo-inicio-schema";


export function useCalendarioVencimientosWeather() {
  return useQuery({
    queryKey: ["calendario-vencimientos-weather"],
    queryFn: createQuery({
      request: () => api.get("/servicio-weather/calendario-vencimientos"),
      schema: CalendarVencimientosApiSchema.array(),
    }),
  });
}

export function useCalendarioVencimientosPro() {
  return useQuery({
    queryKey: ["calendario-vencimientos-pro"],
    queryFn: createQuery({
      request: () => api.get("/servicio-pro/calendario-vencimientos"),
      schema: CalendarVencimientosApiSchema.array(),
    }),
  });
}

export function useCalendarioVencimientosMC() {
  return useQuery({
    queryKey: ["calendario-vencimientos-mc"],
    queryFn: createQuery({
      request: () => api.get("/servicio-mc/calendario-vencimientos"),
      schema: CalendarVencimientosApiSchema.array(),
    }),
  });
}

export function useCalendarioVencimientosChips() {
  return useQuery({
    queryKey: ["calendario-vencimientos-chips"],
    queryFn: createQuery({
      request: () => api.get("/servicio-chips/calendario-vencimientos"),
      schema: CalendarVencimientosApiSchema.array(),
    }),
  });
}